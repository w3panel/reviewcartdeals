import type { BasePayload, Where } from 'payload'

<<<<<<< HEAD
import { getBrandIdsByTitlesCached, getCategoryIdsBySlugCached } from '@/lib/cachedLookups'
import { type CatalogSort, parseCatalogSort } from '@/lib/catalogUrl'
=======
import { parseListParam, parseVariantsParam } from '@/lib/catalogFilterParams'
import { getBrandIdsByTitlesCached, getCategoryIdsBySlugsCached } from '@/lib/cachedLookups'
>>>>>>> 8ddc32c (enhanced filteres option)
import { withPublishedOnly } from '@/lib/publishedOnly'
import { findProductIdsByVariantFilters } from '@/lib/variantFilterLookups'

export type { CatalogSort }

export interface CatalogQueryOptions {
  categorySlug?: string
  featured?: boolean
  search?: string
  brand?: string
<<<<<<< HEAD
  sort?: CatalogSort | string
=======
  spec?: string
  variants?: string
>>>>>>> 8ddc32c (enhanced filteres option)
  page?: number
  limit?: number
}

const CATALOG_CARD_SELECT = {
  title: true,
  slug: true,
  description: true,
  brand: true,
  category: true,
  gallery: true,
  valueGalleries: true,
  featured: true,
  limitedEdition: true,
  enableVariants: true,
  averageRating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
} as const

export function resolveCatalogSort(sort?: CatalogSort | string): string {
  switch (parseCatalogSort(typeof sort === 'string' ? sort : sort)) {
    case 'newest':
      return '-createdAt'
    case 'rating':
      return '-averageRating,-reviewCount,-createdAt'
    case 'popular':
    default:
      return '-featured,-createdAt'
  }
}

const IMPOSSIBLE_ID = -1

function noMatchWhere(): Where {
  return { id: { equals: IMPOSSIBLE_ID } }
}

async function findProductIdsBySpecKeys(
  payload: BasePayload,
  specKeys: string[],
): Promise<number[]> {
  if (specKeys.length === 0) return []

  try {
    const { rows } = await payload.db.pool.query<{ id: number }>(
      `SELECT p.id
       FROM products p
       WHERE p._status = 'published'
         AND (
           SELECT COUNT(DISTINCT ps.key)
           FROM products_specifications ps
           WHERE ps._parent_id = p.id
             AND ps.key = ANY($1::text[])
         ) = $2`,
      [specKeys, specKeys.length],
    )

    return rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))
  } catch {
    const response = await payload.find({
      collection: 'products',
      where: withPublishedOnly(),
      depth: 0,
      limit: 1000,
      pagination: false,
      select: {
        specifications: true,
      },
    })

    return response.docs
      .filter((product) => {
        const productKeys = new Set(
          (product.specifications ?? [])
            .map((row) => row.key?.trim())
            .filter((key): key is string => Boolean(key)),
        )
        return specKeys.every((key) => productKeys.has(key))
      })
      .map((product) => product.id)
  }
}

function intersectProductIds(current: number[] | null, next: number[]): number[] {
  if (next.length === 0) return []
  if (current === null) return next
  const nextSet = new Set(next)
  return current.filter((id) => nextSet.has(id))
}

export async function buildProductsWhere(
  options: Pick<
    CatalogQueryOptions,
    'categorySlug' | 'featured' | 'search' | 'brand' | 'spec' | 'variants'
  >,
  payload: BasePayload,
): Promise<Where | undefined> {
  const { categorySlug, featured, search, brand, spec, variants } = options
  const andFilters: Where[] = []
  let productIdFilter: number[] | null = null

  if (featured !== undefined) {
    andFilters.push({
      featured: {
        equals: featured,
      },
    })
  }

  if (brand) {
    const titles = brand
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean)
    const brandIds = await getBrandIdsByTitlesCached(titles, payload)

    if (brandIds.length === 0) {
      andFilters.push(noMatchWhere())
    } else {
      andFilters.push({
        brand: {
          in: brandIds,
        },
      })
    }
  }

  if (categorySlug) {
    const slugs = categorySlug
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean)
    const categoryIds = await getCategoryIdsBySlugsCached(slugs, payload)

    if (categoryIds.length === 0) {
      andFilters.push(noMatchWhere())
    } else {
      andFilters.push({
        category: {
          in: categoryIds,
        },
      })
    }
  }

  if (search) {
    const ftsProductIds = await findProductIdsByFullTextSearch(payload, search)
    productIdFilter = intersectProductIds(productIdFilter, ftsProductIds)
    if (productIdFilter.length === 0) {
      andFilters.push(noMatchWhere())
    }
  }

  const specKeys = parseListParam(spec)
  if (specKeys.length > 0) {
    const specProductIds = await findProductIdsBySpecKeys(payload, specKeys)
    productIdFilter = intersectProductIds(productIdFilter, specProductIds)
    if (productIdFilter.length === 0) {
      andFilters.push(noMatchWhere())
    }
  }

  const variantFilters = parseVariantsParam(variants)
  if (Object.keys(variantFilters).length > 0) {
    const variantProductIds = await findProductIdsByVariantFilters(payload, variantFilters)
    productIdFilter = intersectProductIds(productIdFilter, variantProductIds)
    if (productIdFilter.length === 0) {
      andFilters.push(noMatchWhere())
    }
  }

  if (productIdFilter !== null && productIdFilter.length > 0) {
    andFilters.push({
      id: {
        in: productIdFilter,
      },
    })
  }

  return andFilters.length > 0 ? { and: andFilters } : undefined
}

async function findProductIdsByFullTextSearch(
  payload: BasePayload,
  search: string,
): Promise<number[]> {
  const trimmed = search.trim()
  if (!trimmed) return []

  try {
    const { rows } = await payload.db.pool.query<{ id: number }>(
      `SELECT id
       FROM products
       WHERE _status = 'published'
         AND search_vector @@ plainto_tsquery('english', $1)
       ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
       LIMIT 200`,
      [trimmed],
    )

    return rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))
  } catch {
    const response = await payload.find({
      collection: 'products',
      where: withPublishedOnly({
        or: [{ title: { like: trimmed } }, { description: { like: trimmed } }],
      }),
      depth: 0,
      limit: 200,
      pagination: false,
    })

    return response.docs.map((doc) => Number(doc.id)).filter((id) => Number.isFinite(id))
  }
}

export async function findCatalogProducts(payload: BasePayload, options: CatalogQueryOptions = {}) {
  const { page = 1, limit = 12, sort } = options
  const where = await buildProductsWhere(options, payload)

  return payload.find({
    collection: 'products',
    where: withPublishedOnly(where),
    page,
    limit,
    depth: 1,
    sort: resolveCatalogSort(sort),
    select: CATALOG_CARD_SELECT,
  })
}
