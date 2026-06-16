import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  PayloadRequest,
} from 'payload'

import type { Product, VariantOptionValue, VariantType } from '@/payload-types'
import { getAllowedOptionValueIdsForType } from '@/lib/productOptionAvailability'
import {
  buildCombinationSignature,
  buildVariantTitleFromOptions,
  getCompleteOptionRows,
  getOptionValueLabel,
  getOptionValueVariantTypeId,
  getRelationshipId,
  type VariantOptionRow,
} from '@/lib/variantOptionValues'

async function getEffectiveProduct(
  productId: number,
  req: PayloadRequest,
  depth = 0,
): Promise<Product> {
  try {
    const draftProduct = (await req.payload.findByID({
      collection: 'products',
      id: productId,
      depth,
      overrideAccess: true,
      draft: true,
    })) as Product

    if (draftProduct._status === 'draft') {
      return draftProduct
    }
  } catch {
    // No draft version.
  }

  return (await req.payload.findByID({
    collection: 'products',
    id: productId,
    depth,
    overrideAccess: true,
    draft: false,
  })) as Product
}

async function resolveVariantType(id: number, req: PayloadRequest): Promise<VariantType> {
  return (await req.payload.findByID({
    collection: 'variant-types',
    id,
    depth: 0,
    overrideAccess: true,
    draft: false,
  })) as VariantType
}

async function resolveOptionValue(
  optionValueId: number,
  req: PayloadRequest,
): Promise<VariantOptionValue> {
  return (await req.payload.findByID({
    collection: 'variant-option-values',
    id: optionValueId,
    depth: 0,
    overrideAccess: true,
    draft: false,
  })) as VariantOptionValue
}

function getProductVariantOptionTypeIds(product: Product): number[] {
  return (product.variantOptionTypes ?? [])
    .map((entry) => getRelationshipId(entry))
    .filter((id): id is number => id !== null)
}

export async function getProductVariantTypeIds(
  product: unknown,
  req: PayloadRequest,
): Promise<number[]> {
  const productId = getRelationshipId(product)
  if (!productId) return []

  const resolvedProduct = await getEffectiveProduct(productId, req, 2)
  return getProductVariantOptionTypeIds(resolvedProduct)
}

function mergeOptionRows(
  incoming: VariantOptionRow[],
  existing: VariantOptionRow[] | undefined,
): VariantOptionRow[] {
  if (!existing?.length) return incoming

  const existingByType = new Map<number, VariantOptionRow>()
  for (const row of existing) {
    const typeId = getRelationshipId(row.type)
    if (typeId !== null) existingByType.set(typeId, row)
  }

  return incoming.map((row) => {
    const typeId = getRelationshipId(row.type)
    if (getRelationshipId(row.optionValue) || typeId === null) return row

    const previous = existingByType.get(typeId)
    return getRelationshipId(previous?.optionValue)
      ? { ...row, optionValue: previous.optionValue }
      : row
  })
}

async function assertUniqueVariantCombination(
  productId: number,
  options: VariantOptionRow[],
  req: PayloadRequest,
  excludeVariantId?: number,
): Promise<void> {
  const signature = buildCombinationSignature(options)
  if (!signature) return

  const existing = await req.payload.find({
    collection: 'product-variants',
    where: {
      and: [
        { product: { equals: productId } },
        ...(excludeVariantId ? [{ id: { not_equals: excludeVariantId } }] : []),
      ],
    },
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
  })

  for (const variant of existing.docs) {
    const existingSignature = buildCombinationSignature(
      (variant.options ?? []) as VariantOptionRow[],
    )
    if (existingSignature === signature) {
      throw new Error('A variant with this option combination already exists for this product.')
    }
  }
}

async function validateVariantOptions(
  options: VariantOptionRow[],
  product: Product,
  req: PayloadRequest,
  isPublished: boolean,
): Promise<void> {
  const allowedTypeIds = getProductVariantOptionTypeIds(product)
  const completeOptions = getCompleteOptionRows(options)

  if (isPublished && allowedTypeIds.length === 0) {
    throw new Error('Assign variant option types on the product before publishing variants.')
  }

  if (isPublished && completeOptions.length === 0) {
    throw new Error('At least one variant option is required.')
  }

  const seenTypeIds = new Set<number>()

  for (const option of completeOptions) {
    const typeId = getRelationshipId(option.type)
    const optionValueId = getRelationshipId(option.optionValue)

    if (!typeId || !optionValueId) {
      throw new Error('Each variant option requires a type and catalog value.')
    }

    if (!allowedTypeIds.includes(typeId)) {
      const variantType = await resolveVariantType(typeId, req)
      throw new Error(
        `"${variantType.label}" is not configured as a variant option type on this product.`,
      )
    }

    if (seenTypeIds.has(typeId)) {
      throw new Error('Duplicate variant types are not allowed on the same variant.')
    }
    seenTypeIds.add(typeId)

    const optionValue = await resolveOptionValue(optionValueId, req)
    const optionValueTypeId =
      getOptionValueVariantTypeId(optionValue) ?? getRelationshipId(optionValue.variantType)

    if (optionValueTypeId !== typeId) {
      const variantType = await resolveVariantType(typeId, req)
      throw new Error(`The selected value does not belong to ${variantType.label}.`)
    }

    const allowedValueIds = getAllowedOptionValueIdsForType(product, typeId)
    if (allowedValueIds.size > 0 && !allowedValueIds.has(optionValueId)) {
      const variantType = await resolveVariantType(typeId, req)
      throw new Error(
        `"${getOptionValueLabel({ optionValue })}" is not in this product's available values for ${variantType.label}.`,
      )
    }

    if (isPublished && optionValue._status !== 'published') {
      throw new Error(
        `"${getOptionValueLabel({ optionValue })}" must be published before this variant can be published.`,
      )
    }
  }

  if (isPublished && allowedTypeIds.length > 0) {
    const missingTypeIds = allowedTypeIds.filter((typeId) => !seenTypeIds.has(typeId))
    if (missingTypeIds.length > 0) {
      const labels = await Promise.all(
        missingTypeIds.map(async (typeId) => (await resolveVariantType(typeId, req)).label),
      )
      throw new Error(
        `Missing variant options for: ${labels.join(', ')}. Add one row per variant option type.`,
      )
    }
  }
}

export const validateProductVariant: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return data

  const isPublished = data._status === 'published'
  const productId = getRelationshipId(data.product)
  const variantId =
    operation === 'update' && originalDoc?.id != null ? Number(originalDoc.id) : undefined

  if (!productId) {
    if (isPublished) throw new Error('Product is required.')
    return data
  }

  let options = (
    data.options !== undefined ? data.options : operation === 'update' ? originalDoc?.options : []
  ) as VariantOptionRow[]

  if (operation === 'update' && originalDoc?.options?.length) {
    options = mergeOptionRows(options, originalDoc.options as VariantOptionRow[])
  }

  data.options = options

  const product = await getEffectiveProduct(productId, req, 2)
  const completeOptions = getCompleteOptionRows(options)

  if (isPublished) {
    data.options = completeOptions
    await validateVariantOptions(completeOptions, product, req, true)
    await assertUniqueVariantCombination(productId, completeOptions, req, variantId)
  } else if (completeOptions.length > 0) {
    await validateVariantOptions(completeOptions, product, req, false)
    await assertUniqueVariantCombination(productId, completeOptions, req, variantId)
  }

  const title = buildVariantTitleFromOptions(data.options as VariantOptionRow[])
  if (title) data.title = title

  return data
}

export const autoTitleProductVariant: CollectionBeforeChangeHook = ({ data }) => {
  if (!data?.options?.length) return data

  const title = buildVariantTitleFromOptions(data.options as VariantOptionRow[])
  if (title) data.title = title

  return data
}
