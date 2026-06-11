import { getProductMainImage } from '@/lib/utils'
import type { Media, Product } from '@/payload-types'

export type ProductVariant = NonNullable<NonNullable<Product['variants']>[number]>
type VariantGalleryRow = NonNullable<NonNullable<ProductVariant['gallery']>[number]>

function isMediaObject(value: unknown): value is Media {
  return value !== null && typeof value === 'object' && 'id' in value
}

function getMediaFromGalleryRow(
  row: VariantGalleryRow | Media | null | undefined,
): number | Media | null | undefined {
  if (!row || typeof row !== 'object') return undefined
  if ('image' in row) return row.image ?? undefined
  if ('url' in row || 'id' in row) return row as Media
  return undefined
}

export function buildVariantGalleryImages(variant: ProductVariant): Media[] {
  if (!variant.gallery?.length) return []

  return variant.gallery.map((row) => getMediaFromGalleryRow(row)).filter(isMediaObject)
}

export function variantHasGallery(variant: ProductVariant): boolean {
  return buildVariantGalleryImages(variant).length > 0
}

export function hasVariants(product: Product): boolean {
  return Boolean(product.variants && product.variants.length > 0)
}

export function formatVariantAttributeSummary(variant: ProductVariant): string {
  if (!variant.attributes?.length) return ''

  return variant.attributes.map((attribute) => `${attribute.key}: ${attribute.value}`).join(', ')
}

export function formatVariantLabel(variant: ProductVariant, index = 0): string {
  const summary = formatVariantAttributeSummary(variant)
  if (summary) return summary
  return `Option ${index + 1}`
}

export function formatVariantEnquiryDetails(variant: ProductVariant): string {
  if (!variant.attributes?.length) return 'Variant selected'

  return variant.attributes.map((attribute) => `${attribute.key}: ${attribute.value}`).join('\n')
}

export function getVariantThumbnail(
  variant: ProductVariant,
  product: Product,
): number | Media | null | undefined {
  const galleryImages = buildVariantGalleryImages(variant)
  if (galleryImages[0]) return galleryImages[0]
  return getProductMainImage(product)
}

export function getCartItemKey(productId: string | number, variantId?: string | null): string {
  return variantId ? `${productId}:${variantId}` : String(productId)
}
