import { unstable_cache } from 'next/cache'
import type { BasePayload } from 'payload'

import { CACHE_TAGS } from '@/lib/cacheTags'
import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'
import { withQueryTiming } from '@/lib/observability'

const LOOKUP_REVALIDATE_SECONDS = 300

async function fetchBrandTitleToIdMap(payload: BasePayload): Promise<Record<string, string>> {
  const response = await payload.find({
    collection: 'brands',
    where: withPublishedOnly(),
    limit: 500,
    depth: 0,
    pagination: false,
    select: { title: true },
  })

  return Object.fromEntries(response.docs.map((brand) => [brand.title, String(brand.id)]))
}

async function fetchCategorySlugToIdMap(payload: BasePayload): Promise<Record<string, string>> {
  const response = await payload.find({
    collection: 'categories',
    where: withPublishedOnly(),
    limit: 500,
    depth: 0,
    pagination: false,
    select: { slug: true },
  })

  return Object.fromEntries(response.docs.map((category) => [category.slug, String(category.id)]))
}

export async function getBrandIdsByTitlesCached(
  titles: string[],
  _payload?: BasePayload,
): Promise<string[]> {
  if (titles.length === 0) return []

  void _payload

  const titleToId = await unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return fetchBrandTitleToIdMap(payload)
    },
    ['brand-title-to-id-map-v2'],
    { tags: [CACHE_TAGS.brands, CACHE_TAGS.lookups], revalidate: LOOKUP_REVALIDATE_SECONDS },
  )()

  return titles.map((title) => titleToId[title]).filter((id): id is string => Boolean(id))
}

export async function getCategoryIdsBySlugsCached(
  slugs: string[],
  _payload?: BasePayload,
): Promise<string[]> {
  if (slugs.length === 0) return []

  void _payload

  const slugToId = await unstable_cache(
    async () => {
      const client = await getPayloadClient()
      return fetchCategorySlugToIdMap(client)
    },
    ['category-slug-to-id-map-v2'],
    { tags: [CACHE_TAGS.categories, CACHE_TAGS.lookups], revalidate: LOOKUP_REVALIDATE_SECONDS },
  )()

  return slugs.map((slug) => slugToId[slug]).filter((id): id is string => Boolean(id))
}

/** @deprecated Use getCategoryIdsBySlugsCached with a single-item array. */
export async function getCategoryIdsBySlugCached(
  slug: string,
  payload?: BasePayload,
): Promise<string[]> {
  return getCategoryIdsBySlugsCached([slug], payload)
}

export async function getAllBrandTitlesCached(payload?: BasePayload): Promise<string[]> {
  const client = payload ?? (await getPayloadClient())

  return unstable_cache(
    async () =>
      withQueryTiming('getAllBrandTitles', async () => {
        const response = await client.find({
          collection: 'brands',
          where: withPublishedOnly(),
          limit: 300,
          depth: 0,
          sort: 'title',
          pagination: false,
          select: { title: true },
        })
        return response.docs.map((brand) => brand.title)
      }),
    ['all-brand-titles'],
    { tags: [CACHE_TAGS.brands], revalidate: LOOKUP_REVALIDATE_SECONDS },
  )()
}
