import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

import type { Product, ProductVariant, VariantValue } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { isAutosaveRequest } from '@/lib/isAutosaveRequest'
import { buildCombinationKey } from '@/lib/variantCombinations'

type VariantGroupSettingRow = NonNullable<Product['variantGroupSettings']>[number]
type ProductVariantOptionRow = NonNullable<ProductVariant['options']>[number]
type ValueGalleryRow = NonNullable<Product['valueGalleries']>[number]

function getProductGroupSettings(product: Product | null | undefined): VariantGroupSettingRow[] {
  return product?.variantGroupSettings ?? []
}

function getAllowedValueIdsForGroup(
  settings: VariantGroupSettingRow[],
  groupId: number,
): Set<number> {
  const row = settings.find((entry) => getRelationshipId(entry.group) === groupId)
  const ids = new Set<number>()
  for (const value of row?.values ?? []) {
    const valueId = getRelationshipId(value)
    if (valueId !== null) ids.add(valueId)
  }
  return ids
}

async function loadProductForValidation(
  productRef: unknown,
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<Product | null> {
  const productId = getRelationshipId(productRef)
  if (productId === null) return null

  return req.payload.findByID({
    collection: 'products',
    id: productId,
    depth: 1,
    draft: Boolean(req.user),
  }) as Promise<Product>
}

async function loadVariantValuesById(
  valueIds: number[],
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<Map<number, VariantValue>> {
  if (valueIds.length === 0) return new Map()

  const result = await req.payload.find({
    collection: 'variant-values',
    where: {
      id: {
        in: valueIds,
      },
    },
    depth: 0,
    draft: Boolean(req.user),
    limit: valueIds.length,
    pagination: false,
  })

  return new Map((result.docs as VariantValue[]).map((value) => [value.id, value]))
}

function hasCompleteVariantOptions(options: ProductVariantOptionRow[]): boolean {
  if (options.length === 0) return false

  return options.every(
    (option) =>
      getRelationshipId(option.group) !== null && getRelationshipId(option.value) !== null,
  )
}

function getVariantGroupLabel(groupRef: VariantGroupSettingRow['group']): string {
  if (groupRef && typeof groupRef === 'object' && 'label' in groupRef) {
    const label = (groupRef as { label?: unknown }).label
    if (typeof label === 'string' && label.trim()) return label.trim()
  }

  const groupId = getRelationshipId(groupRef)
  return groupId === null ? 'this variant group' : `variant group #${groupId}`
}

function valueBelongsToGroup(value: VariantValue | undefined, groupId: number): boolean {
  if (!value) return false
  const valueGroupId = getRelationshipId(value.group)
  return valueGroupId !== null && valueGroupId === groupId
}

function collectValueIdsFromSettings(settings: VariantGroupSettingRow[]): number[] {
  return settings.flatMap((row) =>
    (row.values ?? [])
      .map((value) => getRelationshipId(value))
      .filter((id): id is number => id !== null),
  )
}

function collectValueIdsFromGalleries(galleries: ValueGalleryRow[]): number[] {
  return galleries
    .map((galleryRow) => getRelationshipId(galleryRow.value))
    .filter((id): id is number => id !== null)
}

function addValueToSettingsRow(
  settings: VariantGroupSettingRow[],
  groupId: number,
  valueId: number,
): VariantGroupSettingRow[] {
  const rowIndex = settings.findIndex((row) => getRelationshipId(row.group) === groupId)

  if (rowIndex === -1) {
    return [...settings, { group: groupId, values: [valueId] }]
  }

  const row = settings[rowIndex]
  const existingIds = new Set(
    (row.values ?? [])
      .map((value) => getRelationshipId(value))
      .filter((id): id is number => id !== null),
  )

  if (existingIds.has(valueId)) return settings

  const next = [...settings]
  next[rowIndex] = {
    ...row,
    values: [...(row.values ?? []), valueId],
  }
  return next
}

function mergeDuplicateVariantGroupRows(
  settings: VariantGroupSettingRow[],
): VariantGroupSettingRow[] {
  const mergedByGroupId = new Map<number, VariantGroupSettingRow>()
  const rowsWithoutGroup: VariantGroupSettingRow[] = []

  for (const row of settings) {
    const groupId = getRelationshipId(row.group)
    if (groupId === null) {
      rowsWithoutGroup.push(row)
      continue
    }

    const existing = mergedByGroupId.get(groupId)
    if (!existing) {
      mergedByGroupId.set(groupId, row)
      continue
    }

    const mergedValueIds = new Set<number>()
    for (const value of [...(existing.values ?? []), ...(row.values ?? [])]) {
      const valueId = getRelationshipId(value)
      if (valueId !== null) mergedValueIds.add(valueId)
    }

    mergedByGroupId.set(groupId, {
      ...existing,
      values: [...mergedValueIds],
    })
  }

  return [...mergedByGroupId.values(), ...rowsWithoutGroup]
}

export const preserveProductFieldsOnPartialUpdate: CollectionBeforeValidateHook<Product> = ({
  data,
  originalDoc,
}) => {
  if (!data || !originalDoc) return data

  if (typeof data.title !== 'string' || data.title.trim() === '') {
    data.title = originalDoc.title
  }

  if (typeof data.slug !== 'string' || data.slug.trim() === '') {
    data.slug = originalDoc.slug
  }

  return data
}

export const sanitizeProductVariantConfig: CollectionBeforeValidateHook<Product> = async ({
  data,
  req,
}) => {
  if (!data?.enableVariants) return data

  let settings = (data.variantGroupSettings ?? []) as VariantGroupSettingRow[]
  const galleries = (data.valueGalleries ?? []) as ValueGalleryRow[]

  const valueIds = [
    ...new Set([
      ...collectValueIdsFromSettings(settings),
      ...collectValueIdsFromGalleries(galleries),
    ]),
  ]
  const valuesById = await loadVariantValuesById(valueIds, req)

  for (const galleryRow of galleries) {
    const valueId = getRelationshipId(galleryRow.value)
    if (valueId === null) continue

    const value = valuesById.get(valueId)
    const groupId = getRelationshipId(value?.group)
    if (groupId === null) continue

    settings = addValueToSettingsRow(settings, groupId, valueId)
  }

  const sanitizedSettings = mergeDuplicateVariantGroupRows(
    settings.map((row) => {
      const groupId = getRelationshipId(row.group)
      if (groupId === null) return row

      const values = (row.values ?? []).filter((value) => {
        const valueId = getRelationshipId(value)
        if (valueId === null) return false
        return valueBelongsToGroup(valuesById.get(valueId), groupId)
      })

      return values.length === (row.values ?? []).length ? row : { ...row, values }
    }),
  )

  data.variantGroupSettings = sanitizedSettings

  const allowedValueIds = new Set<number>()
  for (const row of sanitizedSettings) {
    for (const value of row.values ?? []) {
      const valueId = getRelationshipId(value)
      if (valueId !== null) allowedValueIds.add(valueId)
    }
  }

  if (galleries.length > 0) {
    data.valueGalleries = galleries.filter((galleryRow) => {
      const valueId = getRelationshipId(galleryRow.value)
      return valueId === null || allowedValueIds.has(valueId)
    })
  }

  return data
}

export const validateProductVariantConfig: CollectionBeforeValidateHook<Product> = async ({
  data,
  req,
}) => {
  if (!data?.enableVariants) return data

  // Draft autosaves often include empty array rows while the editor is in progress.
  if (isAutosaveRequest(req)) return data

  const settings = ((data.variantGroupSettings ?? []) as VariantGroupSettingRow[]).filter(
    (row) => getRelationshipId(row.group) !== null,
  )

  if (settings.length === 0) {
    throw new Error(
      'Add at least one variant group with available values when variants are enabled.',
    )
  }

  const seenGroups = new Set<number>()
  const valueIds = settings.flatMap((row) =>
    (row.values ?? [])
      .map((value) => getRelationshipId(value))
      .filter((id): id is number => id !== null),
  )
  const valuesById = await loadVariantValuesById(valueIds, req)

  for (const row of settings) {
    const groupId = getRelationshipId(row.group)!

    if (seenGroups.has(groupId)) {
      throw new Error(
        `${getVariantGroupLabel(row.group)} is configured more than once. Remove the duplicate row — each variant group should appear only once.`,
      )
    }
    seenGroups.add(groupId)

    const rowValueIds = (row.values ?? [])
      .map((value) => getRelationshipId(value))
      .filter((id): id is number => id !== null)

    if (rowValueIds.length === 0) {
      throw new Error('Each variant group must have at least one available value.')
    }

    for (const valueId of rowValueIds) {
      const value = valuesById.get(valueId)
      if (!value) {
        throw new Error(`Variant value #${valueId} could not be found.`)
      }

      const valueGroupId = getRelationshipId(value.group)
      const groupLabel = getVariantGroupLabel(row.group)

      if (valueGroupId === null) {
        throw new Error(
          `"${value.label}" does not have a variant group yet. Open it under Catalog → Variant Values, assign a group, and publish.`,
        )
      }

      if (valueGroupId !== groupId) {
        throw new Error(
          `"${value.label}" belongs to ${valueGroupId === null ? 'no group' : `variant group #${valueGroupId}`}, not ${groupLabel}. In Variant Groups (this product), pick only values listed for that row's group.`,
        )
      }
    }
  }

  const galleries = (data.valueGalleries ?? []) as ValueGalleryRow[]
  const allowedValueIds = new Set<number>()
  for (const row of settings) {
    for (const value of row.values ?? []) {
      const valueId = getRelationshipId(value)
      if (valueId !== null) allowedValueIds.add(valueId)
    }
  }

  if (galleries.length > 0) {
    data.valueGalleries = galleries.filter((galleryRow) => {
      const valueId = getRelationshipId(galleryRow.value)
      return valueId === null || allowedValueIds.has(valueId)
    })
  }

  return data
}

export const validateProductVariantOptions: CollectionBeforeValidateHook<ProductVariant> = async ({
  data,
  req,
  originalDoc,
}) => {
  if (isAutosaveRequest(req)) return data

  const options = (data?.options ?? originalDoc?.options ?? []) as ProductVariantOptionRow[]
  if (!hasCompleteVariantOptions(options)) return data

  const product = await loadProductForValidation(data?.product ?? originalDoc?.product, req)
  if (!product?.enableVariants) {
    throw new Error(
      'Enable variants on the parent product and save it before creating or editing product variants.',
    )
  }

  const settings = getProductGroupSettings(product)
  const expectedGroupIds = settings
    .map((row) => getRelationshipId(row.group))
    .filter((id): id is number => id !== null)

  if (expectedGroupIds.length === 0) {
    throw new Error('The parent product has no variant group configuration.')
  }

  if (options.length !== expectedGroupIds.length) {
    throw new Error(
      'Each product variant must include exactly one value per configured variant group.',
    )
  }

  const seenGroups = new Set<number>()

  for (const option of options) {
    const groupId = getRelationshipId(option.group)
    const valueId = getRelationshipId(option.value)

    if (groupId === null || valueId === null) {
      throw new Error('Each option must include a variant group and value.')
    }

    if (!expectedGroupIds.includes(groupId)) {
      throw new Error(
        'This variant references a variant group that is not configured on the product.',
      )
    }

    if (seenGroups.has(groupId)) {
      throw new Error('Duplicate variant groups are not allowed on a single product variant.')
    }
    seenGroups.add(groupId)

    const allowedValues = getAllowedValueIdsForGroup(settings, groupId)
    if (!allowedValues.has(valueId)) {
      throw new Error('This variant uses a value that is not available on the parent product.')
    }
  }

  const productId = getRelationshipId(data?.product ?? originalDoc?.product)
  if (productId === null) return data

  const combinationKey = buildCombinationKey(
    options.map((option) => ({
      groupId: getRelationshipId(option.group)!,
      valueId: getRelationshipId(option.value)!,
    })),
  )

  const existing = await req.payload.find({
    collection: 'product-variants',
    where: {
      and: [
        { product: { equals: productId } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
    depth: 0,
    limit: 500,
    pagination: false,
  })

  for (const doc of existing.docs as ProductVariant[]) {
    const existingKey = buildCombinationKey(
      (doc.options ?? []).map((option) => ({
        groupId: getRelationshipId(option.group)!,
        valueId: getRelationshipId(option.value)!,
      })),
    )
    if (existingKey === combinationKey) {
      throw new Error('A variant with this combination already exists for this product.')
    }
  }

  return data
}

export const setProductVariantTitle: CollectionBeforeChangeHook<ProductVariant> = async ({
  data,
  req,
}) => {
  if (!data?.options?.length) return data

  const labels: string[] = []

  for (const option of data.options) {
    const valueId = getRelationshipId(option.value)
    if (valueId === null) continue

    const value = (await req.payload.findByID({
      collection: 'variant-values',
      id: valueId,
      depth: 0,
      draft: Boolean(req.user),
    })) as VariantValue

    if (value?.label) labels.push(value.label)
  }

  if (labels.length === 0) return data

  return {
    ...data,
    title: labels.join(' / '),
  }
}
