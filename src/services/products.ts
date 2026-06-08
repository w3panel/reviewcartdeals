import { getPayloadClient } from '@/lib/payload'
import { findCatalogProducts, type CatalogQueryOptions } from '@/lib/productFilters'

export type GetProductsOptions = CatalogQueryOptions

export async function getProducts(options: GetProductsOptions = {}) {
  const payload = await getPayloadClient()

  const response = await findCatalogProducts(payload, options)

  return {
    products: response.docs,
    totalDocs: response.totalDocs,
    totalPages: response.totalPages,
    page: response.page,
    hasNextPage: response.hasNextPage,
    hasPrevPage: response.hasPrevPage,
  }
}

export async function getProductBySlug(slug: string) {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'products',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  })

  return response.docs[0] || null
}

export async function getRelatedProducts(productId: string | number, categoryId: string | number, limit = 4) {
  const payload = await getPayloadClient()

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
    depth: 2,
  })

  return response.docs
}

export async function getAllBrands() {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'brands',
    limit: 300,
    sort: 'title',
  })

  // Return brand titles as strings to maintain compatibility with existing frontend
  return response.docs.map((b: any) => b.title)
}

export async function getAllProductSlugs() {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'products',
    limit: 1000,
    depth: 0,
    select: {
      slug: true,
    },
  })

  return response.docs.map((doc) => doc.slug)
}
