import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'
import type { Category, Product } from '@/payload-types'

export async function resolveProductCategory(category: Product['category']): Promise<Category> {
  if (typeof category === 'object' && category !== null) {
    return category as Category
  }

  if (typeof category === 'number') {
    const payload = await getPayloadClient()
    const response = await payload.find({
      collection: 'categories',
      where: withPublishedOnly({ id: { equals: category } }),
      limit: 1,
      depth: 0,
    })
    const doc = response.docs[0]
    if (!doc) {
      throw new Error('Product category is not published or does not exist')
    }
    return doc as Category
  }

  throw new Error('Product is missing a valid category')
}

export function getCategoryId(category: Product['category']): number {
  if (typeof category === 'object' && category !== null) {
    return category.id
  }
  if (typeof category === 'number') {
    return category
  }
  throw new Error('Product is missing a valid category')
}
