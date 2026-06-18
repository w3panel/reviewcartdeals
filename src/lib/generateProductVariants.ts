import type { PayloadRequest } from 'payload'

import type { Product, ProductVariant } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import {
  buildCombinationKey,
  cartesianProduct,
  type CombinationOption,
} from '@/lib/variantCombinations'

export type GenerateProductVariantsResult = {
  created: number
  skipped: number
  totalCombinations: number
}

function getVariantGroupSettings(product: Product) {
  return product.variantGroupSettings ?? []
}

function buildDesiredCombinations(product: Product): CombinationOption[][] {
  const valueLists = getVariantGroupSettings(product).map((row) => {
    const groupId = getRelationshipId(row.group)
    if (groupId === null) return []

    return (row.values ?? [])
      .map((value) => getRelationshipId(value))
      .filter((valueId): valueId is number => valueId !== null)
      .map((valueId) => ({ groupId, valueId }))
  })

  if (valueLists.some((list) => list.length === 0)) {
    throw new Error('Each configured variant group must have at least one available value.')
  }

  return cartesianProduct(valueLists)
}

export async function generateProductVariants(
  payload: PayloadRequest['payload'],
  productId: number,
  req: PayloadRequest,
): Promise<GenerateProductVariantsResult> {
  const product = (await payload.findByID({
    collection: 'products',
    id: productId,
    depth: 0,
  })) as Product

  if (!product.enableVariants) {
    throw new Error('Enable variants on this product before generating combinations.')
  }

  const combinations = buildDesiredCombinations(product)
  if (combinations.length === 0) {
    throw new Error('Configure variant groups and values before generating combinations.')
  }

  const existing = await payload.find({
    collection: 'product-variants',
    where: {
      product: {
        equals: productId,
      },
    },
    depth: 0,
    limit: 1000,
    pagination: false,
    req,
  })

  const existingKeys = new Set(
    (existing.docs as ProductVariant[]).map((variant) =>
      buildCombinationKey(
        (variant.options ?? []).map((option) => ({
          groupId: getRelationshipId(option.group)!,
          valueId: getRelationshipId(option.value)!,
        })),
      ),
    ),
  )

  let created = 0
  let skipped = 0

  for (const combination of combinations) {
    const key = buildCombinationKey(combination)
    if (existingKeys.has(key)) {
      skipped += 1
      continue
    }

    await payload.create({
      collection: 'product-variants',
      data: {
        product: productId,
        active: true,
        options: combination.map((option) => ({
          group: option.groupId,
          value: option.valueId,
        })),
      },
      req,
    })

    existingKeys.add(key)
    created += 1
  }

  return {
    created,
    skipped,
    totalCombinations: combinations.length,
  }
}
