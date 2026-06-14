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

export async function getProductVariantTypeIds(
  product: unknown,
  req: Parameters<CollectionBeforeValidateHook>[0]['req'],
): Promise<number[]> {
  const productId = getRelationshipId(product)
  if (!productId) return []

  async function fetchIds(draft: boolean): Promise<number[]> {
    const doc = (await req.payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
      overrideAccess: true,
      draft,
    })) as Product

    return (doc.variantTypes ?? [])
      .map((entry) => getRelationshipId(entry))
      .filter((id): id is number => typeof id === 'number')
  }

  const [publishedIds, draftIds] = await Promise.all([fetchIds(false), fetchIds(true)])
  return [...new Set([...publishedIds, ...draftIds])]
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
  async function fetchTypes(draft: boolean): Promise<VariantType[]> {
    const product = (await req.payload.findByID({
      collection: 'products',
      id: productId,
      depth: 1,
      overrideAccess: true,
      draft,
    })) as Product

    const variantTypes = product.variantTypes ?? []
    const resolved = await Promise.all(
      variantTypes.map(async (entry) => {
        if (typeof entry === 'object' && entry !== null) {
          return entry
        }

        if (typeof entry === 'number') {
          const publishedType = (await req.payload.findByID({
            collection: 'variant-types',
            id: entry,
            depth: 0,
            overrideAccess: true,
            draft: false,
          })) as VariantType | null

          if (publishedType) return publishedType

          return req.payload.findByID({
            collection: 'variant-types',
            id: entry,
            depth: 0,
            overrideAccess: true,
            draft: true,
          }) as Promise<VariantType>
        }

        return null
      }),
    )

    return resolved.filter((entry): entry is VariantType => entry !== null)
  }

  const [publishedTypes, draftTypes] = await Promise.all([fetchTypes(false), fetchTypes(true)])
  const typesById = new Map<number, VariantType>()

  for (const type of [...publishedTypes, ...draftTypes]) {
    typesById.set(type.id, type)
  }

  return [...typesById.values()]
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
  const optionTypeIds = [
    ...new Set(
      options
        .map((option) => getRelationshipId(option.type))
        .filter((id): id is number => id !== null),
    ),
  ]
  if (optionTypeIds.length === 0) return

  const currentIds = await getProductVariantTypeIds(productId, req)
  const missing = optionTypeIds.filter((id) => !currentIds.includes(id))
  if (missing.length === 0) return

  const [publishedProduct, draftProduct] = await Promise.all([
    req.payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
      overrideAccess: true,
      draft: false,
    }),
    req.payload.findByID({
      collection: 'products',
      id: productId,
      depth: 0,
      overrideAccess: true,
      draft: true,
    }),
  ])

  const enableVariants =
    (draftProduct as Product).enableVariants || (publishedProduct as Product).enableVariants
  if (!enableVariants) return

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

  const merged = [...new Set([...currentIds, ...missing])]
  await req.payload.update({
    collection: 'products',
    id: productId,
    data: {
      enableVariants: true,
      variantTypes: merged,
    },
    draft: (draftProduct as Product)._status === 'draft',
  })
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

  const options = (data.options ?? []) as VariantOptionRow[]
  if (options.length === 0) {
    if (isPublished) {
      throw new Error('At least one variant option is required.')
    }
    return data
  }

  if (!isPublished) {
    if (operation === 'create' || operation === 'update') {
      const title = options
        .map((option) => option.value?.trim())
        .filter((value): value is string => Boolean(value))
        .join(' / ')
      if (title) data.title = title
    }
    return data
  }

  const completeOptions = getCompleteOptions(options)
  if (completeOptions.length === 0) {
    throw new Error('At least one variant option is required.')
  }

  // Drop blank/partial rows the admin UI sometimes leaves behind when publishing.
  data.options = completeOptions

  await syncMissingProductVariantTypes(productId, completeOptions, req)

  const productVariantTypes = await loadProductVariantTypes(productId, req)
  if (productVariantTypes.length === 0) {
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

  if (seenTypeIds.size !== productVariantTypes.length) {
    throw new Error('Product variants must include a value for every variant type on the product.')
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
