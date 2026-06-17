/** Next.js cache tags for Payload-driven revalidation */

export const CACHE_TAGS = {
  nav: 'nav',
  categories: 'categories',
  brands: 'brands',
  products: 'products',
  reviews: 'reviews',
  lookups: 'lookups',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
