import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

import { revalidateAfterReviewChange, revalidateAfterReviewDelete } from '@/lib/revalidateContent'
import { syncProductRatingSummaryFromReview } from '@/lib/syncProductRatingSummary'

const syncRatingAfterReviewChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await syncProductRatingSummaryFromReview(doc.product, req.payload)
  return doc
}

const syncRatingAfterReviewDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (doc?.product) {
    await syncProductRatingSummaryFromReview(doc.product, req.payload)
  }
  return doc
}

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'reviewerName',
    defaultColumns: ['reviewerName', 'product', 'rating', 'verifiedPurchase'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [syncRatingAfterReviewChange, revalidateAfterReviewChange],
    afterDelete: [syncRatingAfterReviewDelete, revalidateAfterReviewDelete],
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'reviewerName',
      type: 'text',
      required: true,
      label: 'Reviewer Name',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
    },
    {
      name: 'verifiedPurchase',
      type: 'checkbox',
      defaultValue: true,
      label: 'Verified Purchase',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Review Images',
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
