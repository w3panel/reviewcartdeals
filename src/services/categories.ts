import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getCategories() {
  const payload = await getPayload({
    config: configPromise,
  })

  const response = await payload.find({
    collection: 'categories',
    sort: '-featured',
    limit: 100,
  })

  return response.docs
}

export async function getCategoryBySlug(slug: string) {
  const payload = await getPayload({
    config: configPromise,
  })

  const response = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  return response.docs[0] || null
}
