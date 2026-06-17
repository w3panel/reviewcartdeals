import type { CollectionBeforeValidateHook } from 'payload'

import { getOptionValueVariantTypeId, getRelationshipId } from '@/lib/variantOptionValues'

type ProductAttributeRow = {
  type?: unknown
  optionValue?: unknown
}

export const validateProductAttributes: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  if (data.productAttributes === undefined && originalDoc?.productAttributes) {
    return data
  }

  const attributes = (data.productAttributes ?? []) as ProductAttributeRow[]
  const variantOptionTypeIds = new Set<number>(
    ((data.variantOptionTypes ?? []) as unknown[])
      .map((entry) => getRelationshipId(entry))
      .filter((id): id is number => id !== null),
  )

  const seenAttributeTypeIds = new Set<number>()

  for (const attribute of attributes) {
    const typeId = getRelationshipId(attribute.type)
    const optionValueId = getRelationshipId(attribute.optionValue)

    if (!typeId || !optionValueId) {
      throw new Error('Each product attribute requires a type and catalog value.')
    }

    if (seenAttributeTypeIds.has(typeId)) {
      throw new Error('Duplicate product attribute types are not allowed.')
    }
    seenAttributeTypeIds.add(typeId)

    if (variantOptionTypeIds.has(typeId)) {
      throw new Error(
        'A variant type cannot be both a product attribute and a variant option type on the same product.',
      )
    }

    let optionValueTypeId = getOptionValueVariantTypeId(attribute.optionValue)
    if (optionValueTypeId === null) {
      const optionValue = await req.payload.findByID({
        collection: 'variant-option-values',
        id: optionValueId,
        depth: 0,
        overrideAccess: true,
      })
      optionValueTypeId = getRelationshipId(optionValue.variantType)
    }

    if (optionValueTypeId !== typeId) {
      throw new Error('The selected attribute value does not belong to the selected type.')
    }
  }

  return data
}
