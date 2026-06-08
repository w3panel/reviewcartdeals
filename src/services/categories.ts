import { getPayloadClient } from '@/lib/payload'

export async function getCategories() {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'categories',
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

export async function getCategoryBySlug(slug: string) {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
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

export async function getAllCategorySlugs() {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'categories',
    limit: 500,
    depth: 0,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return response.docs.map((doc) => doc.slug)
}
