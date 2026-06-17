import { cache } from 'react'
import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cacheTags'
import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'
import { findCatalogProducts, type CatalogQueryOptions } from '@/lib/productFilters'
import { getAllBrandTitlesCached } from '@/lib/cachedLookups'
import { withQueryTiming } from '@/lib/observability'
import type { ProductVariant } from '@/payload-types'

const DATA_REVALIDATE_SECONDS = 120

export type GetProductsOptions = CatalogQueryOptions

async function fetchProductBySlug(slug: string) {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'products',
    where: withPublishedOnly({
      slug: {
        equals: slug,
      },
    }),
    limit: 1,
    depth: 2,
  })

  return response.docs[0] || null
}

async function fetchProductVariants(productId: string | number): Promise<ProductVariant[]> {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'product-variants',
    where: withPublishedOnly({
      product: {
        equals: productId,
      },
    }),
    depth: 2,
    limit: 500,
    pagination: false,
    select: {
      title: true,
      product: true,
      options: true,
      gallery: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return response.docs as ProductVariant[]
}

async function fetchRelatedProducts(
  productId: string | number,
  categoryId: string | number,
  limit = 4,
) {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'products',
    where: withPublishedOnly({
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
    }),
    limit,
    depth: 1,
    select: {
      title: true,
      slug: true,
      brand: true,
      gallery: true,
      description: true,
      enableVariants: true,
      category: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return response.docs
}

export async function getProducts(options: GetProductsOptions = {}) {
  return withQueryTiming('getProducts', async () => {
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
  })
}

export const getProductBySlug = cache(async (slug: string) => {
  return unstable_cache(
    async () => withQueryTiming(`getProductBySlug:${slug}`, () => fetchProductBySlug(slug)),
    ['product-by-slug', slug],
    { tags: [CACHE_TAGS.products, `product:${slug}`], revalidate: DATA_REVALIDATE_SECONDS },
  )()
})

export async function getProductVariants(productId: string | number) {
  return unstable_cache(
    async () =>
      withQueryTiming(`getProductVariants:${productId}`, () => fetchProductVariants(productId)),
    ['product-variants', String(productId)],
    {
      tags: [CACHE_TAGS.products, `product-variants:${productId}`],
      revalidate: DATA_REVALIDATE_SECONDS,
    },
  )()
}

export async function getRelatedProducts(
  productId: string | number,
  categoryId: string | number,
  limit = 4,
) {
  return unstable_cache(
    async () =>
      withQueryTiming(`getRelatedProducts:${productId}`, () =>
        fetchRelatedProducts(productId, categoryId, limit),
      ),
    ['related-products', String(productId), String(categoryId), String(limit)],
    { tags: [CACHE_TAGS.products], revalidate: DATA_REVALIDATE_SECONDS },
  )()
}

export async function getAllBrands() {
  return getAllBrandTitlesCached()
}

export async function getAllProductSlugs() {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'products',
    where: withPublishedOnly(),
    limit: 1000,
    depth: 0,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return response.docs.map((doc) => doc.slug)
}
