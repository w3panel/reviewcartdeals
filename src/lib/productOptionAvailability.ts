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

export function getVariantOptionTypeIdsFromForm(value: unknown): number[] {
  if (!Array.isArray(value)) return []

  return value.map((entry) => getRelationshipId(entry)).filter((id): id is number => id !== null)
}

export type VariantTypePreview = Pick<VariantType, 'id' | 'label'>

function resolveVariantTypeLabel(entry: unknown, typeId: number): string {
  if (typeof entry === 'object' && entry !== null) {
    if ('name' in entry && typeof entry.name === 'string' && entry.name.trim()) {
      return entry.name.trim()
    }
    if ('label' in entry && typeof entry.label === 'string' && entry.label.trim()) {
      return entry.label.trim()
    }
  }

  return `Type ${typeId}`
}

export function resolveVariantTypesForPreview(
  variantOptionTypesValue: unknown,
  availability: AvailabilityRow[],
  typeLabelById: Record<number, string> = {},
): VariantTypePreview[] {
  const typeIds = getVariantOptionTypeIdsFromForm(variantOptionTypesValue)
  if (typeIds.length === 0) return []

  const typesById = new Map<number, VariantTypePreview>()

  if (Array.isArray(variantOptionTypesValue)) {
    for (const entry of variantOptionTypesValue) {
      const typeId = getRelationshipId(entry)
      if (typeId === null) continue
      typesById.set(typeId, {
        id: typeId,
        label: typeLabelById[typeId] ?? resolveVariantTypeLabel(entry, typeId),
      })
    }
  }

  for (const row of availability) {
    const typeId = getRelationshipId(row.type)
    if (typeId === null || typesById.has(typeId)) continue

    typesById.set(typeId, {
      id: typeId,
      label: typeLabelById[typeId] ?? resolveVariantTypeLabel(row.type, typeId),
    })
  }

  return typeIds.map((typeId) => {
    const existing = typesById.get(typeId)
    return (
      existing ?? {
        id: typeId,
        label: typeLabelById[typeId] ?? `Type ${typeId}`,
      }
    )
  })
}

export function formatMissingTypeLabels(
  labels: string[],
  typeLabelById: Record<number, string>,
): string[] {
  return labels.map((label) => {
    const match = /^Type (\d+)$/.exec(label)
    if (!match) return label
    const id = Number(match[1])
    return typeLabelById[id] ?? label
  })
}

export function rowHasOptionValues(row: AvailabilityRow): boolean {
  return (row.optionValues ?? []).map((entry) => getRelationshipId(entry)).some((id) => id !== null)
}

function getRowValueIds(row: AvailabilityRow): number[] {
  return (row.optionValues ?? [])
    .map((entry) => getRelationshipId(entry))
    .filter((id): id is number => id !== null)
    .sort((left, right) => left - right)
}

export function availabilityRowsEqual(left: AvailabilityRow[], right: AvailabilityRow[]): boolean {
  if (left.length !== right.length) return false

  return left.every((row, index) => {
    const other = right[index]
    const typeId = getRelationshipId(row.type)
    const otherTypeId = getRelationshipId(other?.type)
    if (typeId !== otherTypeId) return false

    const valueIds = getRowValueIds(row)
    const otherValueIds = getRowValueIds(other ?? {})
    if (valueIds.length !== otherValueIds.length) return false
    return valueIds.every((id, valueIndex) => id === otherValueIds[valueIndex])
  })
}

export async function populateDefaultOptionValues(
  rows: AvailabilityRow[],
  loadPublishedOptionValueIds: (typeId: number) => Promise<number[]>,
): Promise<AvailabilityRow[]> {
  return Promise.all(
    rows.map(async (row) => {
      if (rowHasOptionValues(row)) return row

      const typeId = getRelationshipId(row.type)
      if (typeId === null) return row

      const defaultIds = await loadPublishedOptionValueIds(typeId)
      if (defaultIds.length === 0) return row

      return {
        ...row,
        optionValues: defaultIds,
      }
    }),
  )
}

export function buildSyncedAvailabilityRows(
  typeIds: number[],
  existingRows: AvailabilityRow[],
): AvailabilityRow[] {
  const existingByType = new Map<number, AvailabilityRow>()

  for (const row of existingRows) {
    const typeId = getRelationshipId(row.type)
    if (typeId !== null) existingByType.set(typeId, row)
  }

  return typeIds.map((typeId) => {
    const previous = existingByType.get(typeId)
    return {
      id: previous?.id,
      type: previous?.type ?? typeId,
      optionValues: previous?.optionValues ?? [],
    }
  })
}

function availabilityNeedsSync(typeIds: number[], existingRows: AvailabilityRow[]): boolean {
  if (typeIds.length === 0) return existingRows.length > 0

  const existingTypeIds = existingRows
    .map((row) => getRelationshipId(row.type))
    .filter((id): id is number => id !== null)

  if (existingTypeIds.length !== typeIds.length) return true

  return typeIds.some((typeId, index) => existingTypeIds[index] !== typeId)
}

export function getEffectiveAvailabilityForPreview(
  variantOptionTypesValue: unknown,
  availability: AvailabilityRow[],
): AvailabilityRow[] {
  const typeIds = getVariantOptionTypeIdsFromForm(variantOptionTypesValue)
  if (typeIds.length === 0) return []

  if (!availabilityNeedsSync(typeIds, availability)) {
    return availability
  }

  return buildSyncedAvailabilityRows(typeIds, availability)
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

export function collectOptionValueIds(availability: AvailabilityRow[]): number[] {
  const ids = new Set<number>()

  for (const row of availability) {
    for (const entry of row.optionValues ?? []) {
      const id = getRelationshipId(entry)
      if (id !== null) ids.add(id)
    }
  }

  return Array.from(ids)
}

function resolveOptionValueLabelFromEntry(
  entry: unknown,
  optionValueLabelById: Record<number, string> = {},
): string {
  if (typeof entry === 'object' && entry !== null && 'value' in entry) {
    const label = getOptionValueLabel({ optionValue: entry })
    if (label) return label
  }

  const id = getRelationshipId(entry)
  if (id === null) return ''

  return optionValueLabelById[id] ?? String(id)
}

export function computeVariantMatrixPreview(
  variantOptionTypes: VariantTypePreview[],
  availability: AvailabilityRow[],
  optionValueLabelById: Record<number, string> = {},
): VariantMatrixPreview {
  const missingTypeLabels: string[] = []
  const dimensions: VariantMatrixDimension[] = []

  for (const type of variantOptionTypes) {
    const typeId = type.id
    const row = availability.find((entry) => getRelationshipId(entry.type) === typeId)
    const values = (row?.optionValues ?? [])
      .map((entry) => resolveOptionValueLabelFromEntry(entry, optionValueLabelById))
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
  variantOptionTypes: VariantTypePreview[],
  availability: AvailabilityRow[],
  optionValueLabelById: Record<number, string> = {},
): number {
  return computeVariantMatrixPreview(variantOptionTypes, availability, optionValueLabelById)
    .totalCombinations
}
