import type { Product, VariantType } from '@/payload-types'
import { resolveOptionValueLabel } from '@/lib/variantOptionValues'

function getVariantTypeLabel(type: number | VariantType): string {
  if (typeof type === 'object' && type !== null && 'label' in type) {
    return type.label
  }
  return 'Attribute'
}

export function formatProductAttributesSummary(product: Product): string {
  if (!product.productAttributes?.length) return ''

  return product.productAttributes
    .map((attribute) => {
      const label = getVariantTypeLabel(attribute.type)
      const value = resolveOptionValueLabel(attribute)
      if (!value) return ''
      return `${label}: ${value}`
    })
    .filter(Boolean)
    .join(', ')
}

export function formatProductAttributesDetails(product: Product): string {
  if (!product.productAttributes?.length) return ''

  return product.productAttributes
    .map((attribute) => {
      const label = getVariantTypeLabel(attribute.type)
      const value = resolveOptionValueLabel(attribute)
      if (!value) return ''
      return `${label}: ${value}`
    })
    .filter(Boolean)
    .join('\n')
}
