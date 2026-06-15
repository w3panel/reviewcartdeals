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
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
    return value.id
  }
  if (
    typeof value === 'object' &&
    'id' in value &&
    typeof value.id === 'string' &&
    /^\d+$/.test(value.id)
  ) {
    return Number(value.id)
  }
  return null
}

async function getPublishedProduct(
  productId: number,
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
  depth = 0,
): Promise<Product> {
  return (await req.payload.findByID({
    collection: 'products',
    id: productId,
    depth,
    overrideAccess: true,
    draft: false,
  })) as Product
}

async function getEffectiveProduct(
  productId: number,
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
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
    // No draft version — use the published product below.
  }

  return getPublishedProduct(productId, req, depth)
}

async function resolveVariantTypes(
  variantTypeEntries: Product['variantTypes'],
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<VariantType[]> {
  const resolved = await Promise.all(
    (variantTypeEntries ?? []).map(async (entry) => {
      if (typeof entry === 'object' && entry !== null) {
        return entry
      }

      if (typeof entry === 'number') {
        return req.payload.findByID({
          collection: 'variant-types',
          id: entry,
          depth: 0,
          overrideAccess: true,
          draft: false,
        }) as Promise<VariantType | null>
      }

      return null
    }),
  )

  return resolved.filter((entry): entry is VariantType => entry !== null)
}

function isSharedVariantType(type: VariantType): boolean {
  return Boolean(type.sharedAcrossVariants)
}

function getVariantLevelTypes(types: VariantType[]): VariantType[] {
  return types.filter((type) => !isSharedVariantType(type))
}

export async function getProductVariantTypeIds(
  product: unknown,
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<number[]> {
  const productId = getRelationshipId(product)
  if (!productId) return []

  const productVariantTypes = await loadProductVariantTypes(productId, req)
  return getVariantLevelTypes(productVariantTypes).map((type) => type.id)
}

function getVariantTypeOptionValues(variantType: VariantType): string[] {
  return (variantType.options ?? [])
    .map((option) => option.value?.trim())
    .filter((value): value is string => Boolean(value))
}

async function loadProductVariantTypes(
  productId: number,
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
  options: { publishedOnly?: boolean } = {},
): Promise<VariantType[]> {
  const product = options.publishedOnly
    ? await getPublishedProduct(productId, req, 1)
    : await getEffectiveProduct(productId, req, 1)
  return resolveVariantTypes(product.variantTypes, req)
}

function mergeOptionRows(
  incoming: VariantOptionRow[],
  existing: VariantOptionRow[] | undefined,
): VariantOptionRow[] {
  if (!existing?.length) return incoming

  const existingByType = new Map<number, VariantOptionRow>()
  for (const row of existing) {
    const typeId = getRelationshipId(row.type)
    if (typeId !== null) {
      existingByType.set(typeId, row)
    }
  }

  const mergedIncoming = incoming.map((row) => {
    const typeId = getRelationshipId(row.type)
    const value = row.value?.trim()
    if (value || typeId === null) return row

    const previous = existingByType.get(typeId)
    if (previous?.value?.trim()) {
      return { ...row, value: previous.value }
    }

    return row
  })

  const seenTypeIds = new Set(
    mergedIncoming
      .map((row) => getRelationshipId(row.type))
      .filter((id): id is number => id !== null),
  )

  const preservedRows = existing.filter((row) => {
    const typeId = getRelationshipId(row.type)
    return typeId !== null && !seenTypeIds.has(typeId) && row.value?.trim()
  })

  return [...mergedIncoming, ...preservedRows]
}

function ensureOptionRowsForProductTypes(
  options: VariantOptionRow[],
  productVariantTypes: VariantType[],
): VariantOptionRow[] {
  const seenTypeIds = new Set(
    options
      .map((option) => getRelationshipId(option.type))
      .filter((id): id is number => id !== null),
  )

  const missingRows = getVariantLevelTypes(productVariantTypes)
    .filter((type) => !seenTypeIds.has(type.id))
    .map((type) => ({ type: type.id, value: '' }))

  if (missingRows.length === 0) return options
  return [...options, ...missingRows]
}

async function resolveVariantTypeLabel(
  typeId: number,
  option: VariantOptionRow,
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<string> {
  if (
    typeof option.type === 'object' &&
    option.type !== null &&
    'label' in option.type &&
    typeof option.type.label === 'string' &&
    option.type.label.trim() !== ''
  ) {
    return option.type.label
  }

  try {
    const variantType = (await req.payload.findByID({
      collection: 'variant-types',
      id: typeId,
      depth: 0,
      overrideAccess: true,
      draft: false,
    })) as VariantType
    if (variantType.label) return variantType.label
  } catch {
    // fall through
  }

  return `ID ${typeId}`
}

async function syncMissingProductVariantTypes(
  productId: number,
  options: VariantOptionRow[],
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<void> {
  if (req.context.syncingProductVariantTypes) return

  const optionTypeIds = [
    ...new Set(
      options
        .map((option) => getRelationshipId(option.type))
        .filter((id): id is number => id !== null),
    ),
  ]
  if (optionTypeIds.length === 0) return

  const publishedProduct = await getPublishedProduct(productId, req)
  const currentIds = (publishedProduct.variantTypes ?? [])
    .map((entry) => getRelationshipId(entry))
    .filter((id): id is number => typeof id === 'number')
  const missing = optionTypeIds.filter((id) => !currentIds.includes(id))
  if (missing.length === 0) return

  if (!publishedProduct.enableVariants) return

  for (const id of missing) {
    try {
      await req.payload.findByID({
        collection: 'variant-types',
        id,
        depth: 0,
        overrideAccess: true,
        draft: false,
      })
    } catch {
      throw new Error(`Variant type ID ${id} does not exist.`)
    }
  }

  let saveAsDraft = false
  try {
    const draftProduct = (await req.payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
      overrideAccess: true,
      draft: true,
    })) as Product
    saveAsDraft = draftProduct._status === 'draft'
  } catch {
    // Product has no draft version — update the published record.
  }

  const merged = [...new Set([...currentIds, ...missing])]
  req.context.syncingProductVariantTypes = true
  try {
    await req.payload.update({
      collection: 'products',
      id: productId,
      data: {
        enableVariants: true,
        variantTypes: merged,
      },
      draft: saveAsDraft,
      overrideAccess: true,
    })
  } finally {
    req.context.syncingProductVariantTypes = false
  }
}

function getCompleteOptions(options: VariantOptionRow[]): VariantOptionRow[] {
  return options.filter((option) => {
    const typeId = getRelationshipId(option.type)
    const value = option.value?.trim()
    return Boolean(typeId && value)
  })
}

export const validateProductVariant: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return data

  const status = data._status ?? originalDoc?._status
  const isPublished = status === 'published'
  const productId = getRelationshipId(data.product)

  if (!productId) {
    if (isPublished) {
      throw new Error('Product is required.')
    }
    return data
  }

  const options = (
    data.options !== undefined
      ? data.options
      : operation === 'update'
        ? originalDoc?.options
        : undefined
  ) as VariantOptionRow[] | undefined
  let resolvedOptions = (options ?? []) as VariantOptionRow[]
  if (operation === 'update' && originalDoc?.options?.length) {
    resolvedOptions = mergeOptionRows(resolvedOptions, originalDoc.options as VariantOptionRow[])
  }

  if (!isPublished) {
    const productVariantTypes = await loadProductVariantTypes(productId, req)
    const variantLevelTypes = getVariantLevelTypes(productVariantTypes)
    if (variantLevelTypes.length > 0) {
      resolvedOptions = ensureOptionRowsForProductTypes(resolvedOptions, productVariantTypes)
      data.options = resolvedOptions
    }

    if (operation === 'create' || operation === 'update') {
      const title = resolvedOptions
        .map((option) => option.value?.trim())
        .filter((value): value is string => Boolean(value))
        .join(' / ')
      if (title) data.title = title
    }
    return data
  }

  if (resolvedOptions.length === 0) {
    throw new Error('At least one variant option is required.')
  }

  const productVariantTypesForPublish = await loadProductVariantTypes(productId, req)
  resolvedOptions = ensureOptionRowsForProductTypes(resolvedOptions, productVariantTypesForPublish)

  const completeOptions = getCompleteOptions(resolvedOptions)
  if (completeOptions.length === 0) {
    throw new Error('At least one variant option is required.')
  }

  // Drop blank/partial rows the admin UI sometimes leaves behind when publishing.
  data.options = completeOptions

  await syncMissingProductVariantTypes(productId, completeOptions, req)

  const productVariantTypes = productVariantTypesForPublish
  const requiredVariantTypes = getVariantLevelTypes(productVariantTypes)
  if (requiredVariantTypes.length === 0 && productVariantTypes.length === 0) {
    throw new Error('The selected product has no variant types configured.')
  }

  const allowedTypeIds = new Set(productVariantTypes.map((type) => type.id))
  const seenTypeIds = new Set<number>()

  for (const option of completeOptions) {
    const typeId = getRelationshipId(option.type)
    const value = option.value?.trim()

    if (!typeId || !value) {
      throw new Error('Each variant option requires a type and value.')
    }

    if (!allowedTypeIds.has(typeId)) {
      const selectedLabel = await resolveVariantTypeLabel(typeId, option, req)
      const configuredLabels = productVariantTypes
        .map((entry) => entry.label)
        .filter((label): label is string => Boolean(label))
        .join(', ')

      throw new Error(
        configuredLabels
          ? `"${selectedLabel}" is not assigned to this product. Configured variant types: ${configuredLabels}. Edit the product and add it under Variant Types, then save the product before publishing this variant.`
          : `"${selectedLabel}" is not assigned to this product. Edit the product, enable variants, assign variant types, and save before publishing this variant.`,
      )
    }

    if (seenTypeIds.has(typeId)) {
      throw new Error('Duplicate variant types are not allowed on the same product variant.')
    }
    seenTypeIds.add(typeId)

    const variantType = productVariantTypes.find((type) => type.id === typeId)
    if (!variantType) continue

    const allowedValues = getVariantTypeOptionValues(variantType)
    if (allowedValues.length > 0 && !allowedValues.includes(value)) {
      throw new Error(`"${value}" is not a valid option for ${variantType.label}.`)
    }
  }

  if (requiredVariantTypes.length > 0 && seenTypeIds.size !== requiredVariantTypes.length) {
    const missingLabels = requiredVariantTypes
      .filter((type) => !seenTypeIds.has(type.id))
      .map((type) => type.label)
      .filter((label): label is string => Boolean(label))

    throw new Error(
      missingLabels.length > 0
        ? `Product variants must include a value for every differentiating variant type. Missing: ${missingLabels.join(', ')}.`
        : 'Product variants must include a value for every differentiating variant type.',
    )
  }

  if (operation === 'create' || operation === 'update') {
    data.title =
      completeOptions
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
