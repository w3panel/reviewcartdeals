import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

import type { Product, VariantType } from '@/payload-types'

type VariantOptionRow = {
  type?: number | VariantType | null
  value?: string | null
  id?: string | null
}

function getRelationshipId(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
    return value.id
  }
  return null
}

function getVariantTypeOptionValues(variantType: VariantType): string[] {
  return (variantType.options ?? [])
    .map((option) => option.value?.trim())
    .filter((value): value is string => Boolean(value))
}

async function loadProductVariantTypes(
  productId: number,
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<VariantType[]> {
  const product = (await req.payload.findByID({
    collection: 'products',
    id: productId,
    depth: 1,
    overrideAccess: true,
  })) as Product

  const variantTypes = product.variantTypes ?? []
  return variantTypes.filter(
    (entry): entry is VariantType => typeof entry === 'object' && entry !== null,
  )
}

export const validateProductVariant: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
}) => {
  if (!data) return data

  const productId = getRelationshipId(data.product)
  if (!productId) {
    throw new Error('Product is required.')
  }

  const options = (data.options ?? []) as VariantOptionRow[]
  if (options.length === 0) {
    throw new Error('At least one variant option is required.')
  }

  const productVariantTypes = await loadProductVariantTypes(productId, req)
  if (productVariantTypes.length === 0) {
    throw new Error('The selected product has no variant types configured.')
  }

  const allowedTypeIds = new Set(productVariantTypes.map((type) => type.id))
  const seenTypeIds = new Set<number>()

  for (const option of options) {
    const typeId = getRelationshipId(option.type)
    const value = option.value?.trim()

    if (!typeId || !value) {
      throw new Error('Each variant option requires a type and value.')
    }

    if (!allowedTypeIds.has(typeId)) {
      throw new Error('Variant option type must belong to the product variant types.')
    }

    if (seenTypeIds.has(typeId)) {
      throw new Error('Duplicate variant types are not allowed on the same product variant.')
    }
    seenTypeIds.add(typeId)

    const variantType = productVariantTypes.find((type) => type.id === typeId)
    if (!variantType) continue

    const allowedValues = getVariantTypeOptionValues(variantType)
    if (!allowedValues.includes(value)) {
      throw new Error(`"${value}" is not a valid option for ${variantType.label}.`)
    }
  }

  if (seenTypeIds.size !== productVariantTypes.length) {
    throw new Error('Product variants must include a value for every variant type on the product.')
  }

  if (operation === 'create' || operation === 'update') {
    data.title =
      options
        .map((option) => option.value?.trim())
        .filter((value): value is string => Boolean(value))
        .join(' / ') || data.title
  }

  return data
}

export const autoTitleProductVariant: CollectionBeforeChangeHook = ({ data }) => {
  if (!data?.options?.length) return data

  const title = (data.options as VariantOptionRow[])
    .map((option) => option.value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(' / ')

  if (title) {
    data.title = title
  }

  return data
}
