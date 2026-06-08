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

export function emptyProductReviewStats(): ProductReviewStats {
  return {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { ...EMPTY_RATING_DISTRIBUTION },
  }
}
