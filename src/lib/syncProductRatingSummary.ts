import type { BasePayload } from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { withPublishedOnly } from '@/lib/publishedOnly'
import { markSkipRevalidation } from '@/lib/revalidateContent'

export async function syncProductRatingSummary(
  productId: number,
  payload: BasePayload,
): Promise<void> {
  const response = await payload.find({
    collection: 'reviews',
    where: withPublishedOnly({
      product: { equals: productId },
    }),
    depth: 0,
    limit: 500,
    pagination: false,
    select: { rating: true },
  })

  const ratings = response.docs.map((doc) => Number(doc.rating)).filter((r) => r >= 1 && r <= 5)
  const reviewCount = ratings.length
  const averageRating =
    reviewCount > 0
      ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / reviewCount).toFixed(1))
      : 0

  await payload.update({
    collection: 'products',
    id: productId,
    data: {
      averageRating,
      reviewCount,
    },
    context: (() => {
      const context: Record<string, unknown> = {}
      markSkipRevalidation(context)
      return context
    })(),
    overrideAccess: true,
  })
}

export async function syncProductRatingSummaryFromReview(
  productRef: unknown,
  payload: BasePayload,
): Promise<void> {
  const productId = getRelationshipId(productRef)
  if (productId === null) return
  await syncProductRatingSummary(productId, payload)
}
