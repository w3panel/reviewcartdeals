
import type { BasePayload, Where } from 'payload'

export interface CatalogQueryOptions {
  categorySlug?: string
  featured?: boolean
  search?: string
  brand?: string
  page?: number
  limit?: number
}

async function getCategoryIdsBySlug(slug: string, payload: BasePayload): Promise<string[]> {
  const cats = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 100,
    depth: 0,
  })
  return cats.docs.map((c) => String(c.id))
}

async function getBrandIdsByTitle(title: string, payload: BasePayload): Promise<string[]> {
  const brands = await payload.find({
    collection: 'brands',
    where: {
      title: {
        equals: title,
      },
    },
    limit: 100,
    depth: 0,
  })
  return brands.docs.map((b) => String(b.id))
}

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
    andFilters.push({
      brand: {
        in: await getBrandIdsByTitle(brand, payload),
      },
    })
  }

  if (categorySlug) {
    andFilters.push({
      category: {
        in: await getCategoryIdsBySlug(categorySlug, payload),
      },
    })
  }

  if (search) {
    andFilters.push({
      or: [
        {
          title: {
            like: search,
          },
        },
        {
          shortDescription: {
            like: search,
          },
        },
      ],
    })
  }

  return andFilters.length > 0 ? { and: andFilters } : undefined
}

export async function findCatalogProducts(payload: BasePayload, options: CatalogQueryOptions = {}) {
  const { page = 1, limit = 12 } = options
  const where = await buildProductsWhere(options, payload)

  return payload.find({
    collection: 'products',
    where,
    page,
    limit,
    depth: 1,
    sort: '-createdAt',
  })
}
