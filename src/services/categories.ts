import { cache } from 'react'
import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cacheTags'
import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'
import { withQueryTiming } from '@/lib/observability'

const DATA_REVALIDATE_SECONDS = 300

async function fetchCategories() {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'categories',
    where: withPublishedOnly(),
    sort: '-featured',
    limit: 100,
    depth: 1,
    pagination: false,
    select: {
      title: true,
      slug: true,
      image: true,
      featured: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return response.docs
}

async function fetchCategoryBySlug(slug: string) {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'categories',
    where: withPublishedOnly({
      slug: {
        equals: slug,
      },
    }),
    limit: 1,
    depth: 1,
    select: {
      title: true,
      slug: true,
      description: true,
      image: true,
    },
  })

  return response.docs[0] || null
}

export async function getCategories() {
  return unstable_cache(
    async () => withQueryTiming('getCategories', fetchCategories),
    ['categories-list'],
    { tags: [CACHE_TAGS.categories], revalidate: DATA_REVALIDATE_SECONDS },
  )()
}

export const getCategoryBySlug = cache(async (slug: string) => {
  return unstable_cache(
    async () => withQueryTiming(`getCategoryBySlug:${slug}`, () => fetchCategoryBySlug(slug)),
    ['category-by-slug', slug],
    { tags: [CACHE_TAGS.categories, `category:${slug}`], revalidate: DATA_REVALIDATE_SECONDS },
  )()
})

export async function getAllCategorySlugs() {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'categories',
    where: withPublishedOnly(),
    limit: 500,
    depth: 0,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return response.docs.map((doc) => doc.slug)
}
