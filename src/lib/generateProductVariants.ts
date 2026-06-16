import type { Payload, PayloadRequest } from 'payload'

import type { Product, ProductVariant, VariantOptionValue, VariantType } from '@/payload-types'
import {
  computeCombinationCountFromAvailability,
  getAvailabilityRows,
} from '@/lib/productOptionAvailability'
import {
  buildCombinationSignature,
  getOptionValueLabel,
  getRelationshipId,
  type VariantOptionRow,
} from '@/lib/variantOptionValues'

const MAX_COMBINATIONS = 500

type GenerateProductVariantsResult = {
  created: number
  skipped: number
  totalCombinations: number
  createdVariantIds: number[]
}

async function getEffectiveProduct(productId: number, req: PayloadRequest): Promise<Product> {
  try {
    const draftProduct = (await req.payload.findByID({
      collection: 'products',
      id: productId,
      depth: 2,
      overrideAccess: true,
      draft: true,
    })) as Product

    if (draftProduct._status === 'draft') {
      return draftProduct
    }
  } catch {
    // fall through
  }

  return (await req.payload.findByID({
    collection: 'products',
    id: productId,
    depth: 2,
    overrideAccess: true,
    draft: false,
  })) as Product
}

async function resolveVariantTypes(
  variantTypeEntries: Product['variantOptionTypes'],
  req: PayloadRequest,
): Promise<VariantType[]> {
  const resolved = await Promise.all(
    (variantTypeEntries ?? []).map(async (entry) => {
      const id = getRelationshipId(entry)
      if (id === null) return null

      if (typeof entry === 'object' && entry !== null && 'label' in entry) {
        return entry
      }

      return (await req.payload.findByID({
        collection: 'variant-types',
        id,
        depth: 0,
        overrideAccess: true,
        draft: false,
      })) as VariantType
    }),
  )

  return resolved.filter((entry): entry is VariantType => entry !== null)
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

async function resolveProductOptionValuesByType(
  product: Product,
  variantTypes: VariantType[],
  req: PayloadRequest,
): Promise<Array<{ type: VariantType; values: VariantOptionValue[] }>> {
  const availability = getAvailabilityRows(product)

  return Promise.all(
    variantTypes.map(async (type) => {
      const row = availability.find((entry) => getRelationshipId(entry.type) === type.id)
      const valueIds = (row?.optionValues ?? [])
        .map((entry) => getRelationshipId(entry))
        .filter((id): id is number => id !== null)

      if (valueIds.length === 0) {
        throw new Error(
          `Select available values for "${type.label}" on this product before generating variants.`,
        )
      }

      const values = await Promise.all(valueIds.map((id) => resolveOptionValue(id, req)))
      const unpublished = values.filter((value) => value._status !== 'published')
      if (unpublished.length > 0) {
        const labels = unpublished.map((value) => getOptionValueLabel({ optionValue: value }))
        throw new Error(
          `Publish these option values before generating variants: ${labels.join(', ')}.`,
        )
      }

      return { type, values }
    }),
  )
}

function cartesian<T>(groups: T[][]): T[][] {
  if (groups.length === 0) return [[]]
  return groups.reduce<T[][]>(
    (acc, group) => acc.flatMap((prefix) => group.map((item) => [...prefix, item])),
    [[]],
  )
}

function buildOptionsFromCombination(
  types: VariantType[],
  values: VariantOptionValue[],
): VariantOptionRow[] {
  return types.map((type, index) => ({
    type: type.id,
    optionValue: values[index]?.id,
  }))
}

export async function generateProductVariants(
  payload: Payload,
  productId: number,
  req: PayloadRequest,
): Promise<GenerateProductVariantsResult> {
  const product = await getEffectiveProduct(productId, req)

  if (!product.enableVariants) {
    throw new Error('Enable variants on this product before generating variant combinations.')
  }

  const variantTypes = await resolveVariantTypes(product.variantOptionTypes, req)
  if (variantTypes.length === 0) {
    throw new Error(
      'Assign at least one variant option type to this product before generating variants.',
    )
  }

  const totalCombinations = computeCombinationCountFromAvailability(
    variantTypes,
    getAvailabilityRows(product),
  )
  if (totalCombinations === 0) {
    throw new Error(
      'Configure available values for every variant option type before generating variants.',
    )
  }

  if (totalCombinations > MAX_COMBINATIONS) {
    throw new Error(
      `This product would create ${totalCombinations} combinations. Reduce available values or split the product (limit ${MAX_COMBINATIONS}).`,
    )
  }

  const optionValuesByType = await resolveProductOptionValuesByType(product, variantTypes, req)
  const combinations = cartesian(optionValuesByType.map((entry) => entry.values))

  const existingVariants = await payload.find({
    collection: 'product-variants',
    where: {
      product: {
        equals: productId,
      },
    },
    depth: 1,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
  })

  const existingSignatures = new Set(
    existingVariants.docs
      .map((variant) => buildCombinationSignature((variant.options ?? []) as VariantOptionRow[]))
      .filter((signature): signature is string => Boolean(signature)),
  )

  let created = 0
  let skipped = 0
  const createdVariantIds: number[] = []

  for (const combination of combinations) {
    const options = buildOptionsFromCombination(
      optionValuesByType.map((entry) => entry.type),
      combination,
    )
    const signature = buildCombinationSignature(options)

    if (!signature || existingSignatures.has(signature)) {
      skipped += 1
      continue
    }

    const createdVariant = await payload.create({
      collection: 'product-variants',
      data: {
        product: productId,
        options: options as NonNullable<ProductVariant['options']>,
      },
      draft: true,
      overrideAccess: true,
      req,
    })

    existingSignatures.add(signature)
    createdVariantIds.push(Number(createdVariant.id))
    created += 1
  }

  return {
    created,
    skipped,
    totalCombinations: combinations.length,
    createdVariantIds,
  }
}
