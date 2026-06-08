import type { Product } from '@/payload-types'

export function getCategoryId(category: Product['category']): number {
  if (typeof category === 'object' && category !== null) {
    return category.id
  }
  if (typeof category === 'number') {
    return category
  }
  throw new Error('Product is missing a valid category')
}
