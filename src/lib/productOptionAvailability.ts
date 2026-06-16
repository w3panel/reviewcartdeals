import type { Product, VariantOptionValue, VariantType } from '@/payload-types'
import { getOptionValueLabel, getRelationshipId } from '@/lib/variantOptionValues'

export type AvailabilityRow = {
  type?: number | VariantType | null
  optionValues?: (number | VariantOptionValue)[] | null
  id?: string | null
}

export type VariantMatrixDimension = {
  typeId: number
  label: string
  values: string[]
}

export type VariantMatrixPreview = {
  dimensions: VariantMatrixDimension[]
  totalCombinations: number
  combinations: string[]
  isReady: boolean
  missingTypeLabels: string[]
}

export function getAvailabilityRows(
  product: Pick<Product, 'variantOptionAvailability'>,
): AvailabilityRow[] {
  return (product.variantOptionAvailability ?? []) as AvailabilityRow[]
}

export function getAvailabilityRowForType(
  product: Pick<Product, 'variantOptionAvailability'>,
  typeId: number,
): AvailabilityRow | undefined {
  return getAvailabilityRows(product).find((row) => getRelationshipId(row.type) === typeId)
}

export function getAllowedOptionValueIdsForType(
  product: Pick<Product, 'variantOptionAvailability'>,
  typeId: number,
): Set<number> {
  const row = getAvailabilityRowForType(product, typeId)
  return new Set(
    (row?.optionValues ?? [])
      .map((entry) => getRelationshipId(entry))
      .filter((id): id is number => id !== null),
  )
}

function resolveOptionValueLabelFromEntry(entry: unknown): string {
  if (typeof entry === 'object' && entry !== null && 'value' in entry) {
    const label = getOptionValueLabel({ optionValue: entry })
    if (label) return label
  }
  const id = getRelationshipId(entry)
  return id !== null ? String(id) : ''
}

export function computeVariantMatrixPreview(
  variantOptionTypes: VariantType[],
  availability: AvailabilityRow[],
): VariantMatrixPreview {
  const missingTypeLabels: string[] = []
  const dimensions: VariantMatrixDimension[] = []

  for (const type of variantOptionTypes) {
    const typeId = type.id
    const row = availability.find((entry) => getRelationshipId(entry.type) === typeId)
    const values = (row?.optionValues ?? [])
      .map((entry) => resolveOptionValueLabelFromEntry(entry))
      .filter((label) => label.length > 0)

    if (values.length === 0) {
      missingTypeLabels.push(type.label)
    }

    dimensions.push({
      typeId,
      label: type.label,
      values,
    })
  }

  if (missingTypeLabels.length > 0 || dimensions.length === 0) {
    return {
      dimensions,
      totalCombinations: 0,
      combinations: [],
      isReady: false,
      missingTypeLabels,
    }
  }

  const valueGroups = dimensions.map((dimension) => dimension.values)
  const combinations = cartesianLabels(valueGroups).map((group) => group.join(' / '))

  return {
    dimensions,
    totalCombinations: combinations.length,
    combinations,
    isReady: true,
    missingTypeLabels: [],
  }
}

function cartesianLabels(groups: string[][]): string[][] {
  if (groups.length === 0) return []
  return groups.reduce<string[][]>(
    (acc, group) => acc.flatMap((prefix) => group.map((value) => [...prefix, value])),
    [[]],
  )
}

export function computeCombinationCountFromAvailability(
  variantOptionTypes: VariantType[],
  availability: AvailabilityRow[],
): number {
  return computeVariantMatrixPreview(variantOptionTypes, availability).totalCombinations
}
