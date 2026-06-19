import type { Media, Product, ProductVariant, VariantGroup, VariantValue } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { buildCombinationKey } from '@/lib/variantCombinations'

export type { ProductVariant }

export type SelectedVariantOptions = Record<string, number>

export type VariantGroupSummary = {
  id: number
  label: string
  isVisual: boolean
}

export type VariantValueSummary = {
  id: number
  label: string
  groupId: number
}

export function getCartItemKey(
  productId: string | number,
  variantId?: string | number | null,
): string {
  return variantId != null ? `${productId}:${variantId}` : String(productId)
}

export function hasVariants(product: Product, variants: ProductVariant[] = []): boolean {
  return Boolean(product.enableVariants && variants.length > 0)
}

export function hasVariantConfiguration(product: Product): boolean {
  if (!product.enableVariants) return false

  const hasGroupSettings = (product.variantGroupSettings ?? []).some((row) => {
    const groupId = getRelationshipId(row.group)
    if (groupId === null) return false
    return (row.values ?? []).some((value) => getRelationshipId(value) !== null)
  })

  if (hasGroupSettings) return true

  return (product.valueGalleries ?? []).some((row) => getRelationshipId(row.value) !== null)
}

/** Show color/size pickers when combinations exist or product variant settings are configured. */
export function shouldShowVariantSelector(
  product: Product,
  variants: ProductVariant[] = [],
): boolean {
  return hasVariants(product, variants) || hasVariantConfiguration(product)
}

/** Switch gallery images by selected color when a visual group has per-value galleries. */
export function usesVisualVariantGallery(
  product: Product,
  variants: ProductVariant[] = [],
): boolean {
  if (!product.enableVariants) return false

  const groups = getVariantOptionTypes(product, variants)
  const visualGroup = getPrimaryVisualType(groups)
  if (!visualGroup) return false

  return (product.valueGalleries ?? []).some((row) => getRelationshipId(row.value) !== null)
}

function resolveGroupSummary(group: number | VariantGroup): VariantGroupSummary | null {
  const id = getRelationshipId(group)
  if (id === null) return null

  if (typeof group === 'object' && group !== null) {
    return {
      id,
      label: group.label,
      isVisual: Boolean(group.isVisual),
    }
  }

  return { id, label: String(id), isVisual: false }
}

function resolveValueSummary(value: number | VariantValue): VariantValueSummary | null {
  const id = getRelationshipId(value)
  if (id === null) return null

  if (typeof value === 'object' && value !== null) {
    const groupId = getRelationshipId(value.group)
    if (groupId === null) return null
    return {
      id,
      label: value.label,
      groupId,
    }
  }

  return null
}

export function getVariantGroupsFromProduct(product: Product): VariantGroupSummary[] {
  const groups: VariantGroupSummary[] = []
  const seen = new Set<number>()

  for (const row of product.variantGroupSettings ?? []) {
    const summary = resolveGroupSummary(row.group as number | VariantGroup)
    if (summary && !seen.has(summary.id)) {
      groups.push(summary)
      seen.add(summary.id)
    }
  }

  if (groups.length === 0) {
    for (const row of product.valueGalleries ?? []) {
      const value = row.value
      if (typeof value !== 'object' || value === null) continue

      const summary = resolveGroupSummary(value.group as number | VariantGroup)
      if (summary && !seen.has(summary.id)) {
        groups.push(summary)
        seen.add(summary.id)
      }
    }
  }

  return groups
}

export function getVariantOptionTypes(
  product: Product,
  variants: ProductVariant[],
): VariantGroupSummary[] {
  const fromProduct = getVariantGroupsFromProduct(product)
  if (fromProduct.length > 0) return fromProduct

  const groupMap = new Map<number, VariantGroupSummary>()

  for (const variant of variants) {
    for (const option of variant.options ?? []) {
      const summary = resolveGroupSummary(option.group as number | VariantGroup)
      if (summary) groupMap.set(summary.id, summary)
    }
  }

  return [...groupMap.values()]
}

export function getPrimaryVisualType(groups: VariantGroupSummary[]): VariantGroupSummary | null {
  return groups.find((group) => group.isVisual) ?? null
}

function getAllowedValueIds(product: Product, groupId: number): Set<number> {
  const allowed = new Set<number>()
  for (const row of product.variantGroupSettings ?? []) {
    if (getRelationshipId(row.group) !== groupId) continue
    for (const value of row.values ?? []) {
      const valueId = getRelationshipId(value)
      if (valueId !== null) allowed.add(valueId)
    }
  }

  if (allowed.size === 0) {
    for (const row of product.valueGalleries ?? []) {
      const value = row.value
      if (typeof value !== 'object' || value === null) continue
      if (getRelationshipId(value.group) !== groupId) continue
      allowed.add(value.id)
    }
  }

  return allowed
}

export function getSelectableOptionChoices(
  product: Product,
  variants: ProductVariant[],
  groupId: number,
  selectedOptions: SelectedVariantOptions,
): VariantValueSummary[] {
  const allowedIds = getAllowedValueIds(product, groupId)
  const valueMap = new Map<number, VariantValueSummary>()

  for (const variant of variants) {
    if (!variant.active) continue

    const matchesOtherGroups = (variant.options ?? []).every((option) => {
      const optionGroupId = getRelationshipId(option.group)
      if (optionGroupId === null || optionGroupId === groupId) return true
      const selected = selectedOptions[String(optionGroupId)]
      if (selected === undefined) return true
      return getRelationshipId(option.value) === selected
    })

    if (!matchesOtherGroups) continue

    for (const option of variant.options ?? []) {
      if (getRelationshipId(option.group) !== groupId) continue
      const summary = resolveValueSummary(option.value as number | VariantValue)
      if (summary && allowedIds.has(summary.id)) {
        valueMap.set(summary.id, summary)
      }
    }
  }

  if (valueMap.size === 0 && allowedIds.size > 0) {
    for (const row of product.variantGroupSettings ?? []) {
      if (getRelationshipId(row.group) !== groupId) continue

      for (const value of row.values ?? []) {
        const valueId = getRelationshipId(value)
        if (valueId === null || !allowedIds.has(valueId)) continue

        const summary = resolveValueSummary(value as number | VariantValue)
        valueMap.set(valueId, summary ?? { id: valueId, label: `Option ${valueId}`, groupId })
      }
    }

    for (const row of product.valueGalleries ?? []) {
      const value = row.value
      if (typeof value !== 'object' || value === null) continue
      if (getRelationshipId(value.group) !== groupId) continue
      if (!allowedIds.has(value.id)) continue

      valueMap.set(value.id, {
        id: value.id,
        label: value.label,
        groupId,
      })
    }
  }

  return [...valueMap.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export function resolveSelectedVariant(
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
  groups: VariantGroupSummary[],
): ProductVariant | null {
  if (groups.length === 0) return null

  const activeVariants = variants.filter((variant) => variant.active)

  for (const variant of activeVariants) {
    const matches = groups.every((group) => {
      const selectedValueId = selectedOptions[String(group.id)]
      if (selectedValueId === undefined) return false

      return (variant.options ?? []).some(
        (option) =>
          getRelationshipId(option.group) === group.id &&
          getRelationshipId(option.value) === selectedValueId,
      )
    })

    if (matches) return variant
  }

  return null
}

export function getInitialSelectedOptions(variant: ProductVariant): SelectedVariantOptions {
  const selected: SelectedVariantOptions = {}
  for (const option of variant.options ?? []) {
    const groupId = getRelationshipId(option.group)
    const valueId = getRelationshipId(option.value)
    if (groupId !== null && valueId !== null) {
      selected[String(groupId)] = valueId
    }
  }
  return selected
}

export function getInitialSelectedOptionsForProduct(
  product: Product,
  variants: ProductVariant[],
  groups: VariantGroupSummary[],
): SelectedVariantOptions {
  const firstActive = variants.find((variant) => variant.active)
  if (firstActive) return getInitialSelectedOptions(firstActive)

  const selected: SelectedVariantOptions = {}
  for (const group of groups) {
    const choices = getSelectableOptionChoices(product, variants, group.id, selected)
    if (choices[0]) {
      selected[String(group.id)] = choices[0].id
    }
  }
  return selected
}

function getMediaFromGalleryRow(row: { image?: number | Media | null }): Media | null {
  const image = row.image
  if (image && typeof image === 'object') return image
  return null
}

export function resolveGalleryImages(
  product: Product,
  selectedOptions: SelectedVariantOptions,
  groups: VariantGroupSummary[],
  fallbackImages: Media[],
): Media[] {
  const visualGroup = getPrimaryVisualType(groups)
  if (!visualGroup) return fallbackImages

  const selectedValueId = selectedOptions[String(visualGroup.id)]
  if (selectedValueId === undefined) return fallbackImages

  const galleryRow = (product.valueGalleries ?? []).find(
    (row) => getRelationshipId(row.value) === selectedValueId,
  )

  const images = (galleryRow?.gallery ?? [])
    .map((row) => getMediaFromGalleryRow(row))
    .filter((image): image is Media => image !== null)

  return images.length > 0 ? images : fallbackImages
}

export function getDefaultGalleryImages(product: Product): Media[] {
  const fromMainGallery = (product.gallery ?? [])
    .map((row) => getMediaFromGalleryRow(row))
    .filter((image): image is Media => image !== null)

  if (fromMainGallery.length > 0) return fromMainGallery

  for (const row of product.valueGalleries ?? []) {
    const images = (row.gallery ?? [])
      .map((galleryRow) => getMediaFromGalleryRow(galleryRow))
      .filter((image): image is Media => image !== null)

    if (images.length > 0) return images
  }

  return []
}

export function formatSelectedOptionsDetails(
  product: Product,
  variants: ProductVariant[],
  selectedOptions: SelectedVariantOptions,
  groups: VariantGroupSummary[],
): string {
  const lines = groups
    .map((group) => {
      const valueId = selectedOptions[String(group.id)]
      if (valueId === undefined) return null

      const choice = getSelectableOptionChoices(product, variants, group.id, selectedOptions).find(
        (entry) => entry.id === valueId,
      )

      return choice ? `${group.label}: ${choice.label}` : null
    })
    .filter((line): line is string => Boolean(line))

  return lines.join('\n')
}

export function formatVariantLabel(variant: ProductVariant): string {
  if (variant.title) return variant.title

  const labels = (variant.options ?? [])
    .map((option) => {
      const value = option.value
      if (typeof value === 'object' && value !== null && 'label' in value) {
        return String((value as VariantValue).label)
      }
      return null
    })
    .filter((label): label is string => Boolean(label))

  return labels.join(' / ') || 'Variant'
}

export function formatVariantEnquiryDetails(variant: ProductVariant): string {
  const lines = (variant.options ?? []).map((option) => {
    const groupLabel =
      typeof option.group === 'object' && option.group !== null
        ? (option.group as VariantGroup).label
        : 'Option'
    const valueLabel =
      typeof option.value === 'object' && option.value !== null
        ? (option.value as VariantValue).label
        : String(option.value)
    return `${groupLabel}: ${valueLabel}`
  })

  return lines.join('\n')
}

export function getCombinationKeyFromVariant(variant: ProductVariant): string {
  return buildCombinationKey(
    (variant.options ?? []).map((option) => ({
      groupId: getRelationshipId(option.group)!,
      valueId: getRelationshipId(option.value)!,
    })),
  )
}
