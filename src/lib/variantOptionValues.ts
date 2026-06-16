import type { VariantOptionValue, VariantType } from '@/payload-types'

export type VariantOptionRow = {
  type?: number | VariantType | null
  optionValue?: number | VariantOptionValue | null
  id?: string | null
}

export function getRelationshipId(value: unknown): number | null {
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

export function getOptionValueLabel(optionValue: unknown): string {
  if (typeof optionValue === 'object' && optionValue !== null && 'value' in optionValue) {
    const value = optionValue.value
    if (typeof value === 'string') return value.trim()
  }
  return ''
}

export function getOptionValueVariantTypeId(optionValue: unknown): number | null {
  if (typeof optionValue !== 'object' || optionValue === null || !('variantType' in optionValue)) {
    return null
  }
  return getRelationshipId(optionValue.variantType)
}

export function resolveOptionValueLabel(option: VariantOptionRow): string {
  return getOptionValueLabel(option.optionValue)
}

export function buildCombinationSignature(options: VariantOptionRow[]): string {
  return options
    .map((option) => {
      const typeId = getRelationshipId(option.type)
      const optionValueId = getRelationshipId(option.optionValue)
      if (typeId === null || optionValueId === null) return null
      return `${typeId}:${optionValueId}`
    })
    .filter((entry): entry is string => entry !== null)
    .sort()
    .join('|')
}

export function getCompleteOptionRows(options: VariantOptionRow[]): VariantOptionRow[] {
  return options.filter((option) => {
    const typeId = getRelationshipId(option.type)
    const optionValueId = getRelationshipId(option.optionValue)
    return Boolean(typeId && optionValueId)
  })
}

export function buildVariantTitleFromOptions(options: VariantOptionRow[]): string {
  return getCompleteOptionRows(options)
    .map((option) => resolveOptionValueLabel(option))
    .filter((label) => label.length > 0)
    .join(' / ')
}
