/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export interface GetProductsOptions {
  categorySlug?: string
  featured?: boolean
  search?: string
  brand?: string
  page?: number
  limit?: number
}

export async function getProducts(options: GetProductsOptions = {}) {
  const { categorySlug, featured, search, brand, page = 1, limit = 12 } = options

  const payload = await getPayload({
    config: configPromise,
  })

  const andFilters: any[] = []

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
    // Query category ID first or use nested relationship filter
    // Nested relation query in Payload:
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
          brand: {
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

  const where = andFilters.length > 0 ? { and: andFilters } : undefined

  const response = await payload.find({
    collection: 'products',
    where,
    page,
    limit,
    sort: '-createdAt',
  })

  return {
    products: response.docs,
    totalDocs: response.totalDocs,
    totalPages: response.totalPages,
    page: response.page,
    hasNextPage: response.hasNextPage,
    hasPrevPage: response.hasPrevPage,
  }
}

// Helper to retrieve category IDs by slug
async function getCategoryIdsBySlug(slug: string, payload: any): Promise<string[]> {
  const cats = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 100,
  })
  return cats.docs.map((c: any) => c.id)
}

// Helper to retrieve brand IDs by title
async function getBrandIdsByTitle(title: string, payload: any): Promise<string[]> {
  const brands = await payload.find({
    collection: 'brands',
    where: {
      title: {
        equals: title,
      },
    },
    limit: 100,
  })
  return brands.docs.map((b: any) => b.id)
}

export async function getProductBySlug(slug: string) {
  const payload = await getPayload({
    config: configPromise,
  })

  const response = await payload.find({
    collection: 'products',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  return response.docs[0] || null
}

export async function getRelatedProducts(productId: string | number, categoryId: string | number, limit = 4) {
  const payload = await getPayload({
    config: configPromise,
  })

  const response = await payload.find({
    collection: 'products',
    where: {
      and: [
        {
          category: {
            equals: categoryId,
          },
        },
        {
          id: {
            not_equals: productId,
          },
        },
      ],
    },
    limit,
  })

  return response.docs
}

export async function getAllBrands() {
  const payload = await getPayload({
    config: configPromise,
  })

  const response = await payload.find({
    collection: 'brands',
    limit: 300,
    sort: 'title',
  })

  // Return brand titles as strings to maintain compatibility with existing frontend
  return response.docs.map((b: any) => b.title)
}
