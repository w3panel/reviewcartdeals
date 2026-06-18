import type { Product } from '@/payload-types'
import { getAvailabilityRows } from '@/lib/productOptionAvailability'
import { getRelationshipId } from '@/lib/variantOptionValues'

export type VisualGalleryFormRow = NonNullable<Product['variantVisualGalleries']>[number]

type GalleryImageRow = NonNullable<VisualGalleryFormRow['gallery']>[number]

export function sanitizeGalleryImages(
  gallery: VisualGalleryFormRow['gallery'] | null | undefined,
): GalleryImageRow[] {
  if (!Array.isArray(gallery)) return []

  return gallery.filter((row) => getRelationshipId(row?.image) !== null)
}

export function sanitizeVisualGalleryRow(row: VisualGalleryFormRow): VisualGalleryFormRow {
  return {
    ...row,
    gallery: sanitizeGalleryImages(row.gallery),
  }
}

export function getRequiredVisualOptionValueIds(
  availability: ReturnType<typeof getAvailabilityRows>,
  visualTypeIds: number[],
): number[] {
  const required = new Set<number>()

  for (const row of availability) {
    const typeId = getRelationshipId(row.type)
    if (typeId === null || !visualTypeIds.includes(typeId)) continue

    for (const optionValue of row.optionValues ?? []) {
      const optionValueId = getRelationshipId(optionValue)
      if (optionValueId !== null) required.add(optionValueId)
    }
  }

  return Array.from(required)
}

export function resolveVisualGalleryTypeIds(
  variantOptionTypeIds: number[],
  types: Array<{ id: number; isPrimaryVisualType?: boolean | null }>,
): number[] {
  if (variantOptionTypeIds.length === 0) return []

  const flagged = types
    .filter((type) => type.isPrimaryVisualType)
    .map((type) => type.id)
    .filter((typeId) => variantOptionTypeIds.includes(typeId))

  if (flagged.length > 0) return flagged

  const firstTypeId = variantOptionTypeIds.find((typeId) =>
    types.some((type) => type.id === typeId),
  )
  return firstTypeId ? [firstTypeId] : []
}

export function buildSyncedVisualGalleryRows(
  requiredOptionValueIds: number[],
  existingRows: VisualGalleryFormRow[] = [],
): VisualGalleryFormRow[] {
  const existingByOptionValueId = new Map<number, VisualGalleryFormRow>()

  for (const row of existingRows) {
    const optionValueId = getRelationshipId(row.optionValue)
    if (optionValueId !== null) {
      existingByOptionValueId.set(optionValueId, sanitizeVisualGalleryRow(row))
    }
  }

  return requiredOptionValueIds.map((optionValueId) => {
    const existing = existingByOptionValueId.get(optionValueId)
    if (existing) {
      return {
        ...existing,
        optionValue: optionValueId,
        gallery: sanitizeGalleryImages(existing.gallery),
      }
    }

    return {
      optionValue: optionValueId,
      gallery: [],
    }
  })
}

export function getVisualGalleryAvailabilityKey(
  availability: ReturnType<typeof getAvailabilityRows>,
  visualTypeIds: number[],
): string {
  return getRequiredVisualOptionValueIds(availability, visualTypeIds).join(',')
}

export function visualGalleryRowsEqual(
  left: VisualGalleryFormRow[],
  right: VisualGalleryFormRow[],
): boolean {
  if (left.length !== right.length) return false

  const normalize = (rows: VisualGalleryFormRow[]) =>
    rows
      .map((row) => ({
        optionValueId: getRelationshipId(row.optionValue),
        imageIds: sanitizeGalleryImages(row.gallery)
          .map((entry) => getRelationshipId(entry.image))
          .filter((id): id is number => id !== null)
          .sort((a, b) => a - b),
      }))
      .sort((a, b) => (a.optionValueId ?? 0) - (b.optionValueId ?? 0))

  const leftNormalized = normalize(left)
  const rightNormalized = normalize(right)

  return leftNormalized.every((row, index) => {
    const other = rightNormalized[index]
    if (row.optionValueId !== other?.optionValueId) return false
    if (row.imageIds.length !== other.imageIds.length) return false
    return row.imageIds.every((id, imageIndex) => id === other.imageIds[imageIndex])
  })
}
