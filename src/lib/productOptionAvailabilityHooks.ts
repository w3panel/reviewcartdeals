import type { CollectionBeforeValidateHook } from 'payload'

import type { Product, VariantType } from '@/payload-types'
import { publishedStatusWhere } from '@/lib/publishedOnly'
import { getRelationshipId } from '@/lib/variantOptionValues'
import {
  type AvailabilityRow,
  buildSyncedAvailabilityRows,
  getAvailabilityRows,
  populateDefaultOptionValues,
} from '@/lib/productOptionAvailability'

function getVariantOptionTypeIds(data: Pick<Product, 'variantOptionTypes'>): number[] {
  return (data.variantOptionTypes ?? [])
    .map((entry) => getRelationshipId(entry))
    .filter((id): id is number => id !== null)
}

function sameIdSets(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((id) => setB.has(id))
}

function getAttributeTypeIds(data: Pick<Product, 'productAttributes'>): Set<number> {
  return new Set(
    (data.productAttributes ?? [])
      .map((row) => getRelationshipId((row as { type?: unknown }).type))
      .filter((id): id is number => id !== null),
  )
}

function requiresCompleteAvailability(data: Pick<Product, '_status'>): boolean {
  return data._status === 'published'
}

export const syncVariantOptionAvailability: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data?.enableVariants) {
    if (data) {
      data.variantOptionAvailability = []
    }
    return data
  }

  const typeIds = getVariantOptionTypeIds(data)
  const originalTypeIds = originalDoc ? getVariantOptionTypeIds(originalDoc) : []

  if (
    typeIds.length > 0 &&
    sameIdSets(typeIds, originalTypeIds) &&
    data.variantOptionAvailability === undefined &&
    originalDoc?.variantOptionAvailability
  ) {
    return data
  }

  if (typeIds.length === 0) {
    data.variantOptionAvailability = []
    return data
  }

  const existingRows = (
    data.variantOptionAvailability !== undefined
      ? data.variantOptionAvailability
      : originalDoc?.variantOptionAvailability
  ) as AvailabilityRow[] | undefined

  let rows = buildSyncedAvailabilityRows(typeIds, existingRows ?? [])

  rows = await populateDefaultOptionValues(rows, async (typeId) => {
    const result = await req.payload.find({
      collection: 'variant-option-values',
      where: {
        and: [{ variantType: { equals: typeId } }, publishedStatusWhere],
      },
      depth: 0,
      limit: 250,
      pagination: false,
      overrideAccess: true,
    })

    return result.docs.map((doc) => Number(doc.id))
  })

  data.variantOptionAvailability = rows as Product['variantOptionAvailability']

  return data
}

export const validateProductOptionAvailability: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data?.enableVariants) return data

  if (
    data.variantOptionAvailability === undefined &&
    originalDoc?.variantOptionAvailability &&
    data._status !== 'published'
  ) {
    return data
  }

  const typeIds = getVariantOptionTypeIds(data)
  const attributeTypeIds = getAttributeTypeIds(data)
  const availability = getAvailabilityRows(data)
  const availabilityTypeIds = availability
    .map((row) => getRelationshipId(row.type))
    .filter((id): id is number => id !== null)

  const seenAvailabilityTypes = new Set<number>()

  for (const typeId of availabilityTypeIds) {
    if (seenAvailabilityTypes.has(typeId)) {
      const variantType = await req.payload.findByID({
        collection: 'variant-types',
        id: typeId,
        depth: 0,
        overrideAccess: true,
      })
      throw new Error(`Duplicate available-values row for "${(variantType as VariantType).label}".`)
    }
    seenAvailabilityTypes.add(typeId)

    if (!typeIds.includes(typeId)) {
      throw new Error(
        'Available values include a type that is not listed under Variant Option Types.',
      )
    }

    if (attributeTypeIds.has(typeId)) {
      throw new Error(
        'A variant type cannot appear in both Product Attributes and Available Values.',
      )
    }
  }

  if (requiresCompleteAvailability(data)) {
    for (const typeId of typeIds) {
      if (!seenAvailabilityTypes.has(typeId)) {
        const variantType = await req.payload.findByID({
          collection: 'variant-types',
          id: typeId,
          depth: 0,
          overrideAccess: true,
        })
        throw new Error(
          `Add available values for "${(variantType as VariantType).label}" before publishing.`,
        )
      }
    }
  }

  for (const row of availability) {
    const typeId = getRelationshipId(row.type)
    if (typeId === null) {
      throw new Error('Each available-values row requires a variant type.')
    }

    const valueIds = (row.optionValues ?? [])
      .map((entry) => getRelationshipId(entry))
      .filter((id): id is number => id !== null)

    if (valueIds.length === 0) {
      if (requiresCompleteAvailability(data)) {
        const variantType = await req.payload.findByID({
          collection: 'variant-types',
          id: typeId,
          depth: 0,
          overrideAccess: true,
        })
        throw new Error(
          `Select at least one available value for "${(variantType as VariantType).label}" before publishing.`,
        )
      }
      continue
    }

    const seenValues = new Set<number>()
    for (const valueId of valueIds) {
      if (seenValues.has(valueId)) {
        throw new Error('Duplicate values are not allowed within the same available-values row.')
      }
      seenValues.add(valueId)

      const optionValue = await req.payload.findByID({
        collection: 'variant-option-values',
        id: valueId,
        depth: 0,
        overrideAccess: true,
      })

      const optionValueTypeId = getRelationshipId(optionValue.variantType)
      if (optionValueTypeId !== typeId) {
        const variantType = await req.payload.findByID({
          collection: 'variant-types',
          id: typeId,
          depth: 0,
          overrideAccess: true,
        })
        throw new Error(
          `An available value does not belong to ${(variantType as VariantType).label}.`,
        )
      }
    }
  }

  return data
}
