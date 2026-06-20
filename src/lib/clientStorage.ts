import type { Brand, Media, Product, ProductVariant } from '@/payload-types'
import {
  variantOptionSummariesFromProductVariant,
  type VariantOptionSummary,
} from '@/lib/productVariants'
import { getImageUrl, getProductMainImage } from '@/lib/utils'

export const CART_STORAGE_KEY = 'reviewcartdeals_cart_v4'
export const LIKED_STORAGE_KEY = 'reviewcartdeals_liked_v2'

export type StoredProductSummary = {
  id: number | string
  title: string
  slug: string
  description?: string
  enableVariants?: boolean
  imageUrl?: string
  brandTitle?: string
}

export type StoredVariantSummary = {
  id: number | string
  title?: string | null
  options?: VariantOptionSummary[]
}

export type StoredCartItem = {
  product: StoredProductSummary
  variant?: StoredVariantSummary | null
  quantity: number
}

/** Minimal product shape restored from localStorage for cart/liked UI */
export type DisplayProduct = {
  id: number | string
  title: string
  slug: string
  description?: string
  enableVariants?: boolean
  brand?: Brand | string | number | null
  gallery?: Product['gallery']
  updatedAt: string
  createdAt: string
}

/** Minimal variant shape restored from localStorage for cart UI */
export type DisplayVariant = {
  id: number | string
  title?: string | null
  options?: VariantOptionSummary[]
  updatedAt: string
  createdAt: string
}

function resolveBrandTitle(product: Product | DisplayProduct): string | undefined {
  if (typeof product.brand === 'object' && product.brand !== null) {
    return (product.brand as Brand).title
  }
  if (product.brand != null) {
    return String(product.brand)
  }
  return undefined
}

export function toStoredProductSummary(product: Product | DisplayProduct): StoredProductSummary {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description ?? undefined,
    enableVariants: product.enableVariants ?? undefined,
    imageUrl: getImageUrl(getProductMainImage(product as Product)),
    brandTitle: resolveBrandTitle(product),
  }
}

function resolveStoredVariantOptions(
  variant: ProductVariant | DisplayVariant,
): VariantOptionSummary[] | undefined {
  const firstOption = variant.options?.[0]
  if (firstOption && 'groupLabel' in firstOption && 'valueLabel' in firstOption) {
    return variant.options as VariantOptionSummary[]
  }

  const options = variantOptionSummariesFromProductVariant(variant as ProductVariant)
  return options.length > 0 ? options : undefined
}

export function toStoredVariantSummary(
  variant: ProductVariant | DisplayVariant | null | undefined,
): StoredVariantSummary | null {
  if (!variant) return null

  return {
    id: variant.id,
    title: variant.title,
    options: resolveStoredVariantOptions(variant),
  }
}

export function toDisplayProduct(summary: StoredProductSummary): DisplayProduct {
  const brand = summary.brandTitle
    ? ({ id: summary.brandTitle, title: summary.brandTitle } as unknown as Brand)
    : summary.brandTitle

  const galleryImage: Media | undefined = summary.imageUrl
    ? ({
        id: Number(summary.id) || 0,
        url: summary.imageUrl,
        alt: summary.title,
        updatedAt: '',
        createdAt: '',
      } as unknown as Media)
    : undefined

  return {
    id: summary.id,
    title: summary.title,
    slug: summary.slug,
    description: summary.description,
    enableVariants: summary.enableVariants,
    brand,
    gallery: galleryImage ? [{ image: galleryImage }] : undefined,
    updatedAt: '',
    createdAt: '',
  } as DisplayProduct
}

export function toDisplayVariant(
  summary: StoredVariantSummary | null | undefined,
): DisplayVariant | null {
  if (!summary) return null

  return {
    id: summary.id,
    title: summary.title ?? undefined,
    options: summary.options,
    updatedAt: '',
    createdAt: '',
  }
}

export function migrateLegacyCart(raw: unknown): StoredCartItem[] {
  if (!Array.isArray(raw)) return []

  const items: StoredCartItem[] = []

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue

    const record = item as {
      product?: Product
      variant?: ProductVariant | null
      quantity?: number
    }

    if (!record.product?.id || !record.product.title || !record.product.slug) {
      continue
    }

    items.push({
      product: toStoredProductSummary(record.product),
      variant: toStoredVariantSummary(record.variant) ?? undefined,
      quantity: record.quantity ?? 1,
    })
  }

  return items
}

export function migrateLegacyLiked(raw: unknown): StoredProductSummary[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const product = item as Product
      if (!product.id || !product.title || !product.slug) return null
      return toStoredProductSummary(product)
    })
    .filter((item): item is StoredProductSummary => item !== null)
}
