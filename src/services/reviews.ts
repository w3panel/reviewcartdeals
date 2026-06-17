import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { BasePayload } from 'payload'

import { CACHE_TAGS } from '@/lib/cacheTags'
import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'
import { withQueryTiming } from '@/lib/observability'
import type { Review } from '@/payload-types'

export interface ProductReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

const EMPTY_RATING_DISTRIBUTION = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as const
const DATA_REVALIDATE_SECONDS = 120

export function emptyProductReviewStats(): ProductReviewStats {
  return {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { ...EMPTY_RATING_DISTRIBUTION },
  }
}

function computeStatsFromCounts(
  ratingCounts: Array<{ rating: number; count: number }>,
): ProductReviewStats {
  const stats = emptyProductReviewStats()

  if (ratingCounts.length === 0) {
    return stats
  }

  let totalRating = 0
  let totalReviews = 0

  for (const { rating, count } of ratingCounts) {
    const bucket = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
    if (bucket !== undefined) {
      stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] = count
      totalRating += rating * count
      totalReviews += count
    }
  }

  stats.totalReviews = totalReviews
  stats.averageRating = totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(1)) : 0

  return stats
}

function computeStats(reviews: Pick<Review, 'rating'>[]): ProductReviewStats {
  const ratingCounts = new Map<number, number>()

  for (const review of reviews) {
    ratingCounts.set(review.rating, (ratingCounts.get(review.rating) ?? 0) + 1)
  }

  return computeStatsFromCounts(
    Array.from(ratingCounts.entries()).map(([rating, count]) => ({ rating, count })),
  )
}

async function resolvePayload(payload?: BasePayload) {
  return payload ?? (await getPayloadClient())
}

async function fetchReviewStatsBatchFromDb(
  productIds: Array<string | number>,
  payload: BasePayload,
): Promise<Map<string | number, ProductReviewStats>> {
  const statsByProduct = new Map<string | number, ProductReviewStats>()
  const uniqueIds = [...new Set(productIds.map((id) => Number(id)).filter(Number.isFinite))]

  for (const id of productIds) {
    statsByProduct.set(id, emptyProductReviewStats())
  }

  if (uniqueIds.length === 0) {
    return statsByProduct
  }

  try {
    const { rows } = await payload.db.pool.query<{
      product_id: number
      rating: number
      count: string
    }>(
      `SELECT product_id, rating::int AS rating, COUNT(*)::int AS count
       FROM reviews
       WHERE _status = 'published'
         AND product_id = ANY($1::int[])
       GROUP BY product_id, rating`,
      [uniqueIds],
    )

    const countsByProduct = new Map<number, Array<{ rating: number; count: number }>>()

    for (const row of rows) {
      const productId = Number(row.product_id)
      const existing = countsByProduct.get(productId) ?? []
      existing.push({ rating: Number(row.rating), count: Number(row.count) })
      countsByProduct.set(productId, existing)
    }

    for (const [productId, counts] of countsByProduct) {
      statsByProduct.set(productId, computeStatsFromCounts(counts))
    }

    return statsByProduct
  } catch {
    const client = payload
    const response = await client.find({
      collection: 'reviews',
      where: withPublishedOnly({
        product: {
          in: uniqueIds,
        },
      }),
      depth: 0,
      limit: uniqueIds.length * 100,
      pagination: false,
      select: {
        product: true,
        rating: true,
      },
    })

    const reviewsByProduct = new Map<string | number, Pick<Review, 'rating'>[]>()

    for (const review of response.docs) {
      const productId =
        typeof review.product === 'object' && review.product !== null
          ? review.product.id
          : review.product

      if (productId == null) continue
      const normalizedProductId = productId as string | number

      const existing = reviewsByProduct.get(normalizedProductId) ?? []
      existing.push({ rating: review.rating })
      reviewsByProduct.set(normalizedProductId, existing)
    }

    for (const [productId, reviews] of reviewsByProduct) {
      statsByProduct.set(productId, computeStats(reviews))
    }

    return statsByProduct
  }
}

export async function getProductReviewStatsBatch(
  productIds: Array<string | number>,
  payload?: BasePayload,
): Promise<Map<string | number, ProductReviewStats>> {
  const client = await resolvePayload(payload)

  return withQueryTiming('getProductReviewStatsBatch', () =>
    fetchReviewStatsBatchFromDb(productIds, client),
  )
}

async function fetchProductReviews(productId: string | number) {
  const client = await getPayloadClient()

  const response = await client.find({
    collection: 'reviews',
    where: withPublishedOnly({
      product: {
        equals: productId,
      },
    }),
    limit: 100,
    depth: 1,
    sort: '-createdAt',
    select: {
      reviewerName: true,
      rating: true,
      comment: true,
      verifiedPurchase: true,
      createdAt: true,
      images: true,
    },
  })

  const reviews = response.docs as Review[]
  const stats = computeStats(reviews)

  return {
    reviews,
    stats,
  }
}

export const getProductReviews = cache(async (productId: string | number) => {
  return unstable_cache(
    async () =>
      withQueryTiming(`getProductReviews:${productId}`, () => fetchProductReviews(productId)),
    ['product-reviews', String(productId)],
    { tags: [CACHE_TAGS.reviews, `reviews:${productId}`], revalidate: DATA_REVALIDATE_SECONDS },
  )()
})
