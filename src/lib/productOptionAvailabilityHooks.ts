import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

import type { Product, VariantType } from '@/payload-types'
import { getRelationshipId } from '@/lib/variantOptionValues'
import { type AvailabilityRow, getAvailabilityRows } from '@/lib/productOptionAvailability'

function getVariantOptionTypeIds(data: Pick<Product, 'variantOptionTypes'>): number[] {
  return (data.variantOptionTypes ?? [])
    .map((entry) => getRelationshipId(entry))
    .filter((id): id is number => id !== null)
}

function getAttributeTypeIds(data: Pick<Product, 'productAttributes'>): Set<number> {
  return new Set(
    (data.productAttributes ?? [])
      .map((row) => getRelationshipId((row as { type?: unknown }).type))
      .filter((id): id is number => id !== null),
  )
}

export const syncVariantOptionAvailability: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  if (!data?.enableVariants) return data

  const typeIds = getVariantOptionTypeIds(data)
  if (typeIds.length === 0) {
    data.variantOptionAvailability = []
    return data
  }

  const existingRows = (
    data.variantOptionAvailability !== undefined
      ? data.variantOptionAvailability
      : originalDoc?.variantOptionAvailability
  ) as AvailabilityRow[] | undefined

  const existingByType = new Map<number, AvailabilityRow>()
  for (const row of existingRows ?? []) {
    const typeId = getRelationshipId(row.type)
    if (typeId !== null) existingByType.set(typeId, row)
  }

  data.variantOptionAvailability = typeIds.map((typeId) => {
    const previous = existingByType.get(typeId)
    return {
      id: previous?.id,
      type: typeId,
      optionValues: previous?.optionValues ?? [],
    }
  }) as Product['variantOptionAvailability']

  return data
}

export const validateProductOptionAvailability: CollectionBeforeValidateHook = async ({
  data,
  req,
}) => {
  if (!data?.enableVariants) return data

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

  for (const typeId of typeIds) {
    if (!seenAvailabilityTypes.has(typeId)) {
      const variantType = await req.payload.findByID({
        collection: 'variant-types',
        id: typeId,
        depth: 0,
        overrideAccess: true,
      })
      throw new Error(
        `Add available values for "${(variantType as VariantType).label}" before generating variants.`,
      )
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
      const variantType = await req.payload.findByID({
        collection: 'variant-types',
        id: typeId,
        depth: 0,
        overrideAccess: true,
      })
      throw new Error(
        `Select at least one available value for "${(variantType as VariantType).label}".`,
      )
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
