import type { BasePayload } from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { withPublishedOnly } from '@/lib/publishedOnly'

export async function fetchAvailableVariantValueIds(payload: BasePayload): Promise<Set<number>> {
  const ids = new Set<number>()

  try {
    const { rows } = await payload.db.pool.query<{ value_id: number }>(
      `SELECT DISTINCT pvo.value_id
       FROM product_variants_options pvo
       INNER JOIN product_variants pv ON pv.id = pvo._parent_id
       WHERE pv._status = 'published'
         AND pv.active = true
         AND pvo.value_id IS NOT NULL
       UNION
       SELECT DISTINCT rel.variant_values_id AS value_id
       FROM products_variant_group_settings_rels rel
       INNER JOIN products_variant_group_settings vgs ON vgs.id = rel.parent_id
       INNER JOIN products p ON p.id = vgs._parent_id
       WHERE p._status = 'published'
         AND rel.variant_values_id IS NOT NULL
       UNION
       SELECT DISTINCT pvg.value_id
       FROM products_value_galleries pvg
       INNER JOIN products p ON p.id = pvg._parent_id
       WHERE p._status = 'published'
         AND pvg.value_id IS NOT NULL`,
    )

    for (const row of rows) {
      const id = Number(row.value_id)
      if (Number.isFinite(id)) ids.add(id)
    }

    return ids
  } catch {
    const [variantsResponse, productsResponse] = await Promise.all([
      payload.find({
        collection: 'product-variants',
        where: withPublishedOnly({
          active: { equals: true },
        }),
        depth: 1,
        limit: 2000,
        pagination: false,
        select: { options: true },
      }),
      payload.find({
        collection: 'products',
        where: withPublishedOnly({
          enableVariants: { equals: true },
        }),
        depth: 2,
        limit: 500,
        pagination: false,
        select: {
          variantGroupSettings: true,
          valueGalleries: true,
        },
      }),
    ])

    for (const variant of variantsResponse.docs) {
      for (const option of variant.options ?? []) {
        const valueId = getRelationshipId(option.value)
        if (valueId !== null) ids.add(valueId)
      }
    }

    for (const product of productsResponse.docs) {
      for (const row of product.variantGroupSettings ?? []) {
        for (const value of row.values ?? []) {
          const valueId = getRelationshipId(value)
          if (valueId !== null) ids.add(valueId)
        }
      }

      for (const row of product.valueGalleries ?? []) {
        const valueId = getRelationshipId(row.value)
        if (valueId !== null) ids.add(valueId)
      }
    }

    return ids
  }
}

export async function findProductIdsByVariantFilters(
  payload: BasePayload,
  variantFilters: Record<number, number[]>,
): Promise<number[]> {
  const entries = Object.entries(variantFilters).filter(([, valueIds]) => valueIds.length > 0)
  if (entries.length === 0) return []

  const [fromVariants, fromProductConfig] = await Promise.all([
    findProductIdsFromPublishedVariants(payload, entries),
    findProductIdsFromVariantConfiguration(payload, entries),
  ])

  return [...new Set([...fromVariants, ...fromProductConfig])]
}

async function findProductIdsFromPublishedVariants(
  payload: BasePayload,
  entries: [string, number[]][],
): Promise<number[]> {
  try {
    const conditions: string[] = []
    const values: Array<number | number[]> = []
    let paramIndex = 1

    for (const [groupId, valueIds] of entries) {
      conditions.push(
        `EXISTS (
          SELECT 1
          FROM product_variants_options pvo
          WHERE pvo._parent_id = pv.id
            AND pvo.group_id = $${paramIndex}
            AND pvo.value_id = ANY($${paramIndex + 1}::int[])
        )`,
      )
      values.push(Number(groupId), valueIds)
      paramIndex += 2
    }

    const { rows } = await payload.db.pool.query<{ product_id: number }>(
      `SELECT DISTINCT pv.product_id
       FROM product_variants pv
       WHERE pv._status = 'published'
         AND pv.active = true
         AND pv.product_id IS NOT NULL
         AND ${conditions.join(' AND ')}`,
      values,
    )

    return rows.map((row) => Number(row.product_id)).filter((id) => Number.isFinite(id))
  } catch {
    const response = await payload.find({
      collection: 'product-variants',
      where: withPublishedOnly({
        active: { equals: true },
      }),
      depth: 1,
      limit: 5000,
      pagination: false,
      select: {
        product: true,
        options: true,
      },
    })

    const matchingProductIds = new Set<number>()

    for (const variant of response.docs) {
      const productId = getRelationshipId(variant.product)
      if (productId === null) continue

      const matchesAllGroups = entries.every(([groupId, valueIds]) =>
        (variant.options ?? []).some((option) => {
          const optionGroupId = getRelationshipId(option.group)
          const optionValueId = getRelationshipId(option.value)
          return (
            optionGroupId === Number(groupId) &&
            optionValueId !== null &&
            valueIds.includes(optionValueId)
          )
        }),
      )

      if (matchesAllGroups) matchingProductIds.add(productId)
    }

    return [...matchingProductIds]
  }
}

async function findProductIdsFromVariantConfiguration(
  payload: BasePayload,
  entries: [string, number[]][],
): Promise<number[]> {
  try {
    const groupConditions: string[] = []
    const values: Array<number | number[]> = []
    let paramIndex = 1

    for (const [groupId, valueIds] of entries) {
      groupConditions.push(
        `(
          EXISTS (
            SELECT 1
            FROM products_variant_group_settings vgs
            INNER JOIN products_variant_group_settings_rels rel ON rel.parent_id = vgs.id
            WHERE vgs._parent_id = p.id
              AND vgs.group_id = $${paramIndex}
              AND rel.variant_values_id = ANY($${paramIndex + 1}::int[])
          )
          OR EXISTS (
            SELECT 1
            FROM products_value_galleries pvg
            INNER JOIN variant_values vv ON vv.id = pvg.value_id
            WHERE pvg._parent_id = p.id
              AND vv.group_id = $${paramIndex}
              AND pvg.value_id = ANY($${paramIndex + 1}::int[])
          )
        )`,
      )
      values.push(Number(groupId), valueIds)
      paramIndex += 2
    }

    const { rows } = await payload.db.pool.query<{ id: number }>(
      `SELECT p.id
       FROM products p
       WHERE p._status = 'published'
         AND ${groupConditions.join(' AND ')}`,
      values,
    )

    return rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))
  } catch {
    const response = await payload.find({
      collection: 'products',
      where: withPublishedOnly({
        enableVariants: { equals: true },
      }),
      depth: 2,
      limit: 500,
      pagination: false,
      select: {
        variantGroupSettings: true,
        valueGalleries: true,
      },
    })

    return response.docs
      .filter((product) =>
        entries.every(([groupId, valueIds]) => {
          const groupIdNum = Number(groupId)
          const hasSettingValue = (product.variantGroupSettings ?? []).some((row) => {
            if (getRelationshipId(row.group) !== groupIdNum) return false
            return (row.values ?? []).some((value) => {
              const valueId = getRelationshipId(value)
              return valueId !== null && valueIds.includes(valueId)
            })
          })

          if (hasSettingValue) return true

          return (product.valueGalleries ?? []).some((row) => {
            const value = row.value
            if (typeof value !== 'object' || value === null) return false
            const valueGroupId = getRelationshipId(value.group)
            return valueGroupId === groupIdNum && valueIds.includes(value.id)
          })
        }),
      )
      .map((product) => product.id)
  }
}
