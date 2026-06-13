import { getProductMainImage } from '@/lib/utils'
import type { Media, Product, ProductVariant, VariantType } from '@/payload-types'

export type { ProductVariant }

function isMediaObject(value: unknown): value is Media {
  return value !== null && typeof value === 'object' && 'id' in value
}

function getMediaFromGalleryRow(
  row: NonNullable<ProductVariant['gallery']>[number] | Media | null | undefined,
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

export function hasVariants(product: Product, variants: ProductVariant[] = []): boolean {
  return Boolean(product.enableVariants && variants.length > 0)
}

function getVariantTypeLabel(type: number | VariantType): string {
  if (typeof type === 'object' && type !== null) return type.label
  return 'Option'
}

export function formatVariantAttributeSummary(variant: ProductVariant): string {
  if (!variant.options?.length) return ''

  return variant.options
    .map((option) => `${getVariantTypeLabel(option.type)}: ${option.value}`)
    .join(', ')
}

export function formatVariantLabel(variant: ProductVariant, index = 0): string {
  const summary = formatVariantAttributeSummary(variant)
  if (summary) return summary
  if (variant.title) return variant.title
  return `Option ${index + 1}`
}

export function formatVariantEnquiryDetails(variant: ProductVariant): string {
  if (!variant.options?.length) return 'Variant selected'

  return variant.options
    .map((option) => `${getVariantTypeLabel(option.type)}: ${option.value}`)
    .join('\n')
}

export function getVariantThumbnail(
  variant: ProductVariant,
  product: Product,
): number | Media | null | undefined {
  const galleryImages = buildVariantGalleryImages(variant)
  if (galleryImages[0]) return galleryImages[0]
  return getProductMainImage(product)
}

export function getCartItemKey(
  productId: string | number,
  variantId?: string | number | null,
): string {
  return variantId ? `${productId}:${variantId}` : String(productId)
}

export function matchVariant(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>,
): ProductVariant | null {
  return (
    variants.find((variant) => {
      if (!variant.options?.length) return false

      return variant.options.every((option) => {
        const typeId =
          typeof option.type === 'object' ? String(option.type.id) : String(option.type)
        return selectedOptions[typeId] === option.value
      })
    }) ?? null
  )
}

export function getAvailableOptionValues(
  variants: ProductVariant[],
  variantTypeId: number | string,
): string[] {
  const values = new Set<string>()
  const typeKey = String(variantTypeId)

  for (const variant of variants) {
    for (const option of variant.options ?? []) {
      const optionTypeId =
        typeof option.type === 'object' ? String(option.type.id) : String(option.type)
      if (optionTypeId === typeKey && option.value) {
        values.add(option.value)
      }
    }
  }

  return Array.from(values)
}
