import type { CollectionSlug } from 'payload'

import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'

const PAGE_SIZE = 100

export async function getAllPublishedSlugs(collection: CollectionSlug): Promise<string[]> {
  const payload = await getPayloadClient()
  const slugs: string[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const response = await payload.find({
      collection,
      where: withPublishedOnly(),
      page,
      limit: PAGE_SIZE,
      depth: 0,
      select: { slug: true },
    })

    for (const doc of response.docs) {
      const slug = 'slug' in doc ? doc.slug : undefined
      if (slug) slugs.push(slug)
    }

    hasNextPage = response.hasNextPage
    page += 1
  }

  return slugs
}
