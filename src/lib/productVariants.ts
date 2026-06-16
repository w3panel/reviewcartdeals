import { getProductMainImage } from '@/lib/utils'
import type {
  Media,
  Product,
  ProductVariant,
  VariantOptionValue,
  VariantType,
} from '@/payload-types'
import {
  getOptionValueLabel,
  getRelationshipId,
  resolveOptionValueLabel,
} from '@/lib/variantOptionValues'

export type { ProductVariant }

export type SelectedVariantOptions = Record<string, string>

export type VariantOptionChoice = {
  id: string
  label: string
}

function isMediaObject(value: unknown): value is Media {
  return value !== null && typeof value === 'object' && 'id' in value
}

function getMediaFromGalleryRow(
  row: NonNullable<VariantOptionValue['gallery']>[number] | Media | null | undefined,
): number | Media | null | undefined {
  if (!row || typeof row !== 'object') return undefined
  if ('image' in row) return row.image ?? undefined
  if ('url' in row || 'id' in row) return row as Media
  return undefined
}

function getVariantTypeId(type: number | VariantType): string {
  return typeof type === 'object' && type !== null ? String(type.id) : String(type)
}

function optionValueMatchesSelection(
  option: NonNullable<ProductVariant['options']>[number],
  selectedValue: string,
): boolean {
  const optionValueId = getRelationshipId(option.optionValue)
  const label = resolveOptionValueLabel(option)
  return selectedValue === String(optionValueId) || selectedValue === label
}

export function getVariantOptionTypes(
  product: Product,
  variants: ProductVariant[] = [],
): VariantType[] {
  const fromProduct = (product.variantOptionTypes ?? []).flatMap((entry) => {
    if (typeof entry === 'object' && entry !== null && 'label' in entry) {
      return [entry]
    }
    return []
  })

  if (fromProduct.length > 0) return fromProduct

  const typeById = new Map<number, VariantType>()
  for (const variant of variants) {
    for (const option of variant.options ?? []) {
      if (typeof option.type === 'object' && option.type !== null && 'label' in option.type) {
        typeById.set(option.type.id, option.type)
      }
    }
  }

  return Array.from(typeById.values())
}

export function getPrimaryVisualType(variantOptionTypes: VariantType[]): VariantType | null {
  const flagged = variantOptionTypes.filter((type) => type.isPrimaryVisualType)
  if (flagged.length > 0) return flagged[0]
  return variantOptionTypes[0] ?? null
}

/** @deprecated Use getPrimaryVisualType */
export function getGalleryOptionType(variantOptionTypes: VariantType[]): VariantType | null {
  return getPrimaryVisualType(variantOptionTypes)
}

export function buildOptionValueGalleryImages(
  optionValue: VariantOptionValue | null | undefined,
): Media[] {
  if (!optionValue?.gallery?.length) return []

  return optionValue.gallery.map((row) => getMediaFromGalleryRow(row)).filter(isMediaObject)
}

export function resolveSelectedOptionValue(
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
  variantTypeId: number | string,
): VariantOptionValue | null {
  const typeKey = String(variantTypeId)
  const selectedValue = selectedOptions[typeKey]
  if (!selectedValue) return null

  for (const variant of variants) {
    for (const option of variant.options ?? []) {
      if (getVariantTypeId(option.type) !== typeKey) continue
      if (!optionValueMatchesSelection(option, selectedValue)) continue

      if (typeof option.optionValue === 'object' && option.optionValue !== null) {
        return option.optionValue as VariantOptionValue
      }
    }
  }

  return null
}

export function resolveGalleryImages(
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
  variantOptionTypes: VariantType[],
  defaultGalleryImages: Media[],
): Media[] {
  const galleryType = getPrimaryVisualType(variantOptionTypes)
  if (!galleryType) return defaultGalleryImages

  const optionValue = resolveSelectedOptionValue(variants, selectedOptions, galleryType.id)
  const images = buildOptionValueGalleryImages(optionValue)
  return images.length > 0 ? images : defaultGalleryImages
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
    .map((option) => `${getVariantTypeLabel(option.type)}: ${resolveOptionValueLabel(option)}`)
    .filter((entry) => !entry.endsWith(': '))
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
    .map((option) => `${getVariantTypeLabel(option.type)}: ${resolveOptionValueLabel(option)}`)
    .filter((entry) => !entry.endsWith(': '))
    .join('\n')
}

export function getVariantThumbnail(
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
  variantOptionTypes: VariantType[],
  product: Product,
): number | Media | null | undefined {
  const galleryType = getPrimaryVisualType(variantOptionTypes)
  if (galleryType) {
    const optionValue = resolveSelectedOptionValue(variants, selectedOptions, galleryType.id)
    const galleryImages = buildOptionValueGalleryImages(optionValue)
    if (galleryImages[0]) return galleryImages[0]
  }

  return getProductMainImage(product)
}

export function getCartItemKey(
  productId: string | number,
  variantId?: string | number | null,
): string {
  return variantId ? `${productId}:${variantId}` : String(productId)
}

export function getInitialSelectedOptions(variant: ProductVariant): SelectedVariantOptions {
  const selectedOptions: SelectedVariantOptions = {}

  for (const option of variant.options ?? []) {
    const typeId = getRelationshipId(option.type)
    const optionValueId = getRelationshipId(option.optionValue)
    if (typeId !== null && optionValueId !== null) {
      selectedOptions[String(typeId)] = String(optionValueId)
    }
  }

  return selectedOptions
}

export function variantMatchesSelection(
  variant: ProductVariant,
  selectedOptions: SelectedVariantOptions,
): boolean {
  if (!variant.options?.length) return false

  return Object.entries(selectedOptions).every(([typeId, selectedValue]) => {
    const option = variant.options?.find((row) => getVariantTypeId(row.type) === typeId)
    if (!option) return false
    return optionValueMatchesSelection(option, selectedValue)
  })
}

export function matchVariant(
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
): ProductVariant | null {
  return variants.find((variant) => variantMatchesSelection(variant, selectedOptions)) ?? null
}

export function resolveSelectedVariant(
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
  variantOptionTypes: VariantType[],
): ProductVariant | null {
  const allTypesSelected = variantOptionTypes.every(
    (type) => selectedOptions[String(type.id)] !== undefined,
  )
  if (!allTypesSelected) return null
  return matchVariant(variants, selectedOptions)
}

export function existsVariantMatchingSelection(
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
): boolean {
  return variants.some((variant) => variantMatchesSelection(variant, selectedOptions))
}

export function isOptionValueSelectable(
  variants: ProductVariant[],
  variantTypeId: number | string,
  optionValueId: number | string,
  selectedOptions: SelectedVariantOptions,
): boolean {
  const typeKey = String(variantTypeId)
  const candidateSelection = {
    ...selectedOptions,
    [typeKey]: String(optionValueId),
  }

  return existsVariantMatchingSelection(variants, candidateSelection)
}

export function getSelectableOptionChoices(
  variants: ProductVariant[],
  variantTypeId: number | string,
  selectedOptions: SelectedVariantOptions,
): VariantOptionChoice[] {
  const typeKey = String(variantTypeId)
  const choices = new Map<string, string>()

  for (const variant of variants) {
    for (const option of variant.options ?? []) {
      if (getVariantTypeId(option.type) !== typeKey) continue

      const optionValueId = getRelationshipId(option.optionValue)
      if (optionValueId === null) continue

      const candidateSelection = {
        ...selectedOptions,
        [typeKey]: String(optionValueId),
      }

      if (!existsVariantMatchingSelection(variants, candidateSelection)) continue

      const label = resolveOptionValueLabel(option)
      if (label) {
        choices.set(String(optionValueId), label)
      }
    }
  }

  return Array.from(choices.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function pruneSelectedOptions(
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
  variantOptionTypes: VariantType[],
): SelectedVariantOptions {
  const next: SelectedVariantOptions = {}

  for (const type of variantOptionTypes) {
    const typeKey = String(type.id)
    const selectedValue = selectedOptions[typeKey]
    if (!selectedValue) continue

    const candidate = { ...next, [typeKey]: selectedValue }
    if (existsVariantMatchingSelection(variants, candidate)) {
      next[typeKey] = selectedValue
    }
  }

  return next
}

export function getAvailableOptionValues(
  variants: ProductVariant[],
  variantTypeId: number | string,
): string[] {
  return getSelectableOptionChoices(variants, variantTypeId, {}).map((choice) => choice.id)
}

export function getOptionValueDisplay(
  option: NonNullable<ProductVariant['options']>[number],
): string {
  return resolveOptionValueLabel(option)
}

export { getOptionValueLabel, getRelationshipId }
