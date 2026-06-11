import { getPayloadClient } from '@/lib/payload'
import type { Category, Product } from '@/payload-types'

export async function resolveProductCategory(category: Product['category']): Promise<Category> {
  if (typeof category === 'object' && category !== null) {
    return category as Category
  }

  if (typeof category === 'number') {
    const payload = await getPayloadClient()
    const doc = await payload.findByID({
      collection: 'categories',
      id: category,
      depth: 0,
    })
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
