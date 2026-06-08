import 'server-only'

import type { BasePayload } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import type { ProductReviewStats } from '@/lib/reviewStats'
import { emptyProductReviewStats } from '@/lib/reviewStats'
import type { Review } from '@/payload-types'

export type { ProductReviewStats } from '@/lib/reviewStats'

function resolveProductId(product: Review['product']): string | number | null {
  if (product == null) return null
  if (typeof product === 'object') return product.id
  return product
}

function computeStats(reviews: Pick<Review, 'rating'>[]): ProductReviewStats {
  const stats = emptyProductReviewStats()

  if (reviews.length === 0) {
    return stats
  }

  let totalRating = 0
  for (const review of reviews) {
    totalRating += review.rating
    const bucket = stats.ratingDistribution[review.rating as keyof typeof stats.ratingDistribution]
    if (bucket !== undefined) {
      stats.ratingDistribution[review.rating as keyof typeof stats.ratingDistribution]++
    }
  }

  stats.totalReviews = reviews.length
  stats.averageRating = Number((totalRating / reviews.length).toFixed(1))
  return stats
}

async function resolvePayload(payload?: BasePayload) {
  return payload ?? (await getPayloadClient())
}

export async function getProductReviewStatsBatch(
  productIds: Array<string | number>,
  payload?: BasePayload,
): Promise<Map<string | number, ProductReviewStats>> {
  const statsByProduct = new Map<string | number, ProductReviewStats>()
  const uniqueIds = [...new Set(productIds)]

  for (const id of uniqueIds) {
    statsByProduct.set(id, emptyProductReviewStats())
  }

  if (uniqueIds.length === 0) {
    return statsByProduct
  }

  const client = await resolvePayload(payload)
  const response = await client.find({
    collection: 'reviews',
    where: {
      product: {
        in: uniqueIds,
      },
    },
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
    const productId = resolveProductId(review.product)
    if (productId == null) continue

    const existing = reviewsByProduct.get(productId) ?? []
    existing.push({ rating: review.rating })
    reviewsByProduct.set(productId, existing)
  }

  for (const [productId, reviews] of reviewsByProduct) {
    statsByProduct.set(productId, computeStats(reviews))
  }

  return statsByProduct
}

export async function getProductReviews(productId: string | number, payload?: BasePayload) {
  const client = await resolvePayload(payload)

  const response = await client.find({
    collection: 'reviews',
    where: {
      product: {
        equals: productId,
      },
    },
    limit: 100,
    depth: 2,
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
