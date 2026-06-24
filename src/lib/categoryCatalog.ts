import type { BasePayload } from 'payload'

import { CATEGORY_PAGE_SIZE } from '@/lib/catalogConstants'
import { withPublishedOnly } from '@/lib/publishedOnly'

const categoryCatalogSelect = {
  title: true,
  slug: true,
  image: true,
  featured: true,
  updatedAt: true,
  createdAt: true,
} as const

export type CategoryCatalogQueryOptions = {
  page?: number
  limit?: number
}

export async function findCatalogCategories(
  payload: BasePayload,
  options: CategoryCatalogQueryOptions = {},
) {
  const page = Math.max(1, options.page ?? 1)
  const requestedLimit = options.limit ?? CATEGORY_PAGE_SIZE
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(1, requestedLimit), 50)
    : CATEGORY_PAGE_SIZE

  return payload.find({
    collection: 'categories',
    where: withPublishedOnly(),
    sort: '-featured',
    page,
    limit,
    depth: 1,
    select: categoryCatalogSelect,
  })
}
