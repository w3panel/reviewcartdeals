import { getRelationshipId } from '@/lib/relationships'

export type CombinationOption = {
  groupId: number
  valueId: number
}

export function buildCombinationKey(options: CombinationOption[]): string {
  return [...options]
    .sort((a, b) => a.groupId - b.groupId)
    .map((option) => `${option.groupId}:${option.valueId}`)
    .join('|')
}

export function cartesianProduct<T>(lists: T[][]): T[][] {
  if (lists.length === 0) return []
  return lists.reduce<T[][]>(
    (acc, list) => acc.flatMap((prefix) => list.map((item) => [...prefix, item])),
    [[]],
  )
}

export function previewCombinationCount(
  settings: Array<{ group?: unknown; values?: unknown }>,
): number {
  const valueLists = settings
    .map((row) => {
      const values = Array.isArray(row.values) ? row.values : []
      return values
        .map((value) => getRelationshipId(value))
        .filter((id): id is number => id !== null)
    })
    .filter((values) => values.length > 0)

  if (valueLists.length === 0) return 0
  return cartesianProduct(valueLists).length
}
