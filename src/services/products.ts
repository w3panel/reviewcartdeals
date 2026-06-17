import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'
import { findCatalogProducts, type CatalogQueryOptions } from '@/lib/productFilters'
import type { ProductVariant, VariantOptionValue } from '@/payload-types'
import { getRelationshipId } from '@/lib/variantOptionValues'

function collectOptionValueIds(variants: ProductVariant[]): number[] {
  const ids = new Set<number>()

  for (const variant of variants) {
    for (const option of variant.options ?? []) {
      const id = getRelationshipId(option.optionValue)
      if (id !== null) ids.add(id)
    }
  }

  return Array.from(ids)
}

async function hydrateVariantsWithOptionValues(
  variants: ProductVariant[],
): Promise<ProductVariant[]> {
  const optionValueIds = collectOptionValueIds(variants)
  if (optionValueIds.length === 0) return variants

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'variant-option-values',
    where: withPublishedOnly({
      id: {
        in: optionValueIds,
      },
    }),
    depth: 2,
    limit: optionValueIds.length,
    pagination: false,
  })

  const optionValueById = new Map<number, VariantOptionValue>(
    docs.map((doc) => [Number(doc.id), doc as VariantOptionValue]),
  )

  return variants.map((variant) => ({
    ...variant,
    options: variant.options?.map((option) => {
      const optionValueId = getRelationshipId(option.optionValue)
      if (optionValueId === null) return option

      return {
        ...option,
        optionValue: optionValueById.get(optionValueId) ?? option.optionValue,
      }
    }),
  }))
}

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

export async function getProductVariants(productId: string | number) {
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
  })

  return hydrateVariantsWithOptionValues(response.docs as ProductVariant[])
}

export async function getRelatedProducts(
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

export async function getAllBrands() {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'brands',
    where: withPublishedOnly(),
    limit: 300,
    depth: 0,
    sort: 'title',
    pagination: false,
    select: {
      title: true,
    },
  })

  return response.docs.map((brand) => brand.title)
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
