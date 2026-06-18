import type {
  Media,
  Product,
  ProductVariant,
  VariantOptionValue,
  VariantType,
} from '@/payload-types'
import { getRelationshipId } from '@/lib/variantOptionValues'
import { getPrimaryVisualType } from '@/lib/productVariants'

export type ProductVisualGalleryRow = NonNullable<Product['variantVisualGalleries']>[number]

type GalleryRow = NonNullable<ProductVisualGalleryRow['gallery']>[number]

function isMediaObject(value: unknown): value is Media {
  return value !== null && typeof value === 'object' && 'id' in value
}

function getMediaFromGalleryRow(
  row: GalleryRow | Media | null | undefined,
): number | Media | null | undefined {
  if (!row || typeof row !== 'object') return undefined
  if ('image' in row) return row.image ?? undefined
  if ('url' in row || 'id' in row) return row as Media
  return undefined
}

export function buildVisualGalleryImages(row: ProductVisualGalleryRow | null | undefined): Media[] {
  if (!row?.gallery?.length) return []

  return row.gallery.map((entry) => getMediaFromGalleryRow(entry)).filter(isMediaObject)
}

export function getProductVisualGalleryRows(
  product: Pick<Product, 'variantVisualGalleries'>,
): ProductVisualGalleryRow[] {
  return (product.variantVisualGalleries ?? []) as ProductVisualGalleryRow[]
}

export function findProductVisualGalleryByOptionValueId(
  product: Pick<Product, 'variantVisualGalleries'>,
  optionValueId: number | string | null | undefined,
): ProductVisualGalleryRow | null {
  if (optionValueId === null || optionValueId === undefined) return null
  const targetId = Number(optionValueId)

  return (
    getProductVisualGalleryRows(product).find((row) => {
      const rowOptionValueId = getRelationshipId(row.optionValue)
      return rowOptionValueId !== null && rowOptionValueId === targetId
    }) ?? null
  )
}

export function resolveVisualGalleryOptionValueId(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>,
  variantOptionTypes: VariantType[],
): number | null {
  const typesToTry = [
    getPrimaryVisualType(variantOptionTypes),
    ...variantOptionTypes.filter(
      (type) => type.id !== getPrimaryVisualType(variantOptionTypes)?.id,
    ),
  ].filter((type): type is VariantType => Boolean(type))

  for (const type of typesToTry) {
    const typeKey = String(type.id)
    const selectedValue = selectedOptions[typeKey]
    if (!selectedValue) continue

    const numericId = Number(selectedValue)
    if (Number.isFinite(numericId)) return numericId

    for (const variant of variants ?? []) {
      for (const option of variant.options ?? []) {
        if (String(getRelationshipId(option.type)) !== typeKey) continue
        if (typeof option.optionValue === 'object' && option.optionValue !== null) {
          const optionValue = option.optionValue as VariantOptionValue
          if (optionValue.value === selectedValue) return Number(optionValue.id)
        }
      }
    }
  }

  return null
}

export function resolveProductVisualGalleryImages(
  product: Pick<Product, 'variantVisualGalleries'>,
  variants: ProductVariant[],
  selectedOptions: Record<string, string>,
  variantOptionTypes: VariantType[],
): Media[] {
  const optionValueId = resolveVisualGalleryOptionValueId(
    variants,
    selectedOptions,
    variantOptionTypes,
  )
  if (optionValueId === null) return []

  return buildVisualGalleryImages(findProductVisualGalleryByOptionValueId(product, optionValueId))
}

export function getOptionChoiceThumbnail(
  product: Pick<Product, 'variantVisualGalleries'>,
  optionValueId: number | string,
): Media | null {
  const images = buildVisualGalleryImages(
    findProductVisualGalleryByOptionValueId(product, optionValueId),
  )
  return images[0] ?? null
}
