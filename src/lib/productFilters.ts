import type { BasePayload, Where } from 'payload'

import { getBrandIdsByTitlesCached, getCategoryIdsBySlugCached } from '@/lib/cachedLookups'
import { withPublishedOnly } from '@/lib/publishedOnly'

export interface CatalogQueryOptions {
  categorySlug?: string
  featured?: boolean
  search?: string
  brand?: string
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
  createdAt: true,
  updatedAt: true,
} as const

export async function buildProductsWhere(
  options: Pick<CatalogQueryOptions, 'categorySlug' | 'featured' | 'search' | 'brand'>,
  payload: BasePayload,
): Promise<Where | undefined> {
  const { categorySlug, featured, search, brand } = options
  const andFilters: Where[] = []

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
    andFilters.push({
      brand: {
        in: await getBrandIdsByTitlesCached(titles, payload),
      },
    })
  }

  if (categorySlug) {
    andFilters.push({
      category: {
        in: await getCategoryIdsBySlugCached(categorySlug, payload),
      },
    })
  }

  if (search) {
    const ftsProductIds = await findProductIdsByFullTextSearch(payload, search)
    if (ftsProductIds.length === 0) {
      andFilters.push({ id: { equals: -1 } })
    } else {
      andFilters.push({ id: { in: ftsProductIds } })
    }
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
  const { page = 1, limit = 12 } = options
  const where = await buildProductsWhere(options, payload)

  return payload.find({
    collection: 'products',
    where: withPublishedOnly(where),
    page,
    limit,
    depth: 1,
    sort: '-createdAt',
    select: CATALOG_CARD_SELECT,
  })
}
