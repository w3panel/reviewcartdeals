import { getPayload } from 'payload'
import configPromise from '@payload-config'
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

export async function getProductReviews(productId: string | number) {
  const payload = await getPayload({
    config: configPromise,
  })

  const response = await payload.find({
    collection: 'reviews',
    where: {
      product: {
        equals: productId,
      },
    },
    limit: 100,
    sort: '-createdAt',
  })

  const reviews = response.docs as Review[]

  const stats: ProductReviewStats = {
    averageRating: 0,
    totalReviews: reviews.length,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  }

  if (reviews.length > 0) {
    let totalRating = 0
    reviews.forEach((review) => {
      totalRating += review.rating
      if (stats.ratingDistribution[review.rating as keyof typeof stats.ratingDistribution] !== undefined) {
        stats.ratingDistribution[review.rating as keyof typeof stats.ratingDistribution]++
      }
    })
    stats.averageRating = Number((totalRating / reviews.length).toFixed(1))
  }

  return {
    reviews,
    stats,
  }
}
