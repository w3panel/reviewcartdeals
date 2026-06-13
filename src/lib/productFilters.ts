import type { BasePayload, Where } from 'payload'
import { withPublishedOnly } from '@/lib/publishedOnly'

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
    where: withPublishedOnly({
      slug: {
        equals: slug,
      },
    }),
    limit: 1,
    depth: 0,
    pagination: false,
  })
  return cats.docs.map((c) => String(c.id))
}

async function getBrandIdsByTitles(titles: string[], payload: BasePayload): Promise<string[]> {
  const brands = await payload.find({
    collection: 'brands',
    where: withPublishedOnly({
      title: {
        in: titles,
      },
    }),
    limit: titles.length,
    depth: 0,
    pagination: false,
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
    const titles = brand
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean)
    andFilters.push({
      brand: {
        in: await getBrandIdsByTitles(titles, payload),
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
          description: {
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
    where: withPublishedOnly(where),
    page,
    limit,
    depth: 2,
    sort: '-createdAt',
    select: {
      title: true,
      slug: true,
      description: true,
      brand: true,
      category: true,
      gallery: true,
      featured: true,
      limitedEdition: true,
      variants: true,
      specifications: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}
