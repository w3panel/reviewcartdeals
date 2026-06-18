import type { CollectionBeforeValidateHook } from 'payload'

import type { Product, VariantType } from '@/payload-types'
import { getAvailabilityRows } from '@/lib/productOptionAvailability'
import {
  buildSyncedVisualGalleryRows,
  getRequiredVisualOptionValueIds,
  resolveVisualGalleryTypeIds,
  sanitizeVisualGalleryRow,
  visualGalleryRowsEqual,
} from '@/lib/syncVariantVisualGalleries'
import { getRelationshipId } from '@/lib/variantOptionValues'

type VisualGalleryRow = NonNullable<Product['variantVisualGalleries']>[number]

async function getVisualGalleryTypeIds(
  variantOptionTypeIds: number[],
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<number[]> {
  if (variantOptionTypeIds.length === 0) return []

  const { docs } = await req.payload.find({
    collection: 'variant-types',
    where: {
      id: {
        in: variantOptionTypeIds,
      },
    },
    depth: 0,
    limit: variantOptionTypeIds.length,
    pagination: false,
    overrideAccess: true,
  })

  return resolveVisualGalleryTypeIds(variantOptionTypeIds, docs as VariantType[])
}

export const syncVariantVisualGalleries: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data?.enableVariants) {
    data.variantVisualGalleries = []
    return data
  }

  const variantOptionTypeIds = (data.variantOptionTypes ?? originalDoc?.variantOptionTypes ?? [])
    .map((entry: unknown) => getRelationshipId(entry))
    .filter((id: number | null): id is number => id !== null)

  if (variantOptionTypeIds.length === 0) {
    data.variantVisualGalleries = []
    return data
  }

  const visualTypeIds = await getVisualGalleryTypeIds(variantOptionTypeIds, req)
  const requiredOptionValueIds = getRequiredVisualOptionValueIds(
    getAvailabilityRows({
      variantOptionAvailability:
        data.variantOptionAvailability ?? originalDoc?.variantOptionAvailability,
    }),
    visualTypeIds,
  )

  const existingRows = (
    data.variantVisualGalleries !== undefined
      ? data.variantVisualGalleries
      : originalDoc?.variantVisualGalleries
  ) as VisualGalleryRow[] | undefined

  const syncedRows = buildSyncedVisualGalleryRows(requiredOptionValueIds, existingRows ?? []).map(
    sanitizeVisualGalleryRow,
  )

  const sanitizedExisting = (existingRows ?? []).map(sanitizeVisualGalleryRow)

  if (!visualGalleryRowsEqual(sanitizedExisting, syncedRows)) {
    data.variantVisualGalleries = syncedRows
  }

  return data
}

export const sanitizeVariantVisualGalleriesOnSave: CollectionBeforeValidateHook = ({ data }) => {
  if (!data?.variantVisualGalleries?.length) return data

  const sanitized = data.variantVisualGalleries.map((row: VisualGalleryRow) =>
    sanitizeVisualGalleryRow(row),
  )

  if (!visualGalleryRowsEqual(data.variantVisualGalleries, sanitized)) {
    data.variantVisualGalleries = sanitized
  }

  return data
}
