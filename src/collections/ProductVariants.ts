import type { CollectionConfig } from 'payload'

import { filterValuesByGroupId } from '@/collections/VariantValues'
import { getRelationshipId } from '@/lib/relationships'
import { setProductVariantTitle, validateProductVariantOptions } from '@/lib/variantValidation'

export const ProductVariants: CollectionConfig = {
  slug: 'product-variants',
  labels: {
    singular: 'Product Variant',
    plural: 'Product Variants',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'product', 'active', '_status'],
    description:
      'One row per purchasable combination. Generated from the product configuration or edited manually.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [validateProductVariantOptions],
    beforeChange: [setProductVariantTitle],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Auto-generated from selected values. You can override if needed.',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Inactive variants are hidden on the storefront.',
      },
    },
    {
      name: 'options',
      type: 'array',
      labels: {
        singular: 'Option',
        plural: 'Options',
      },
      admin: {
        description: 'One value per variant group on the parent product.',
      },
      fields: [
        {
          name: 'group',
          label: 'Variant Group',
          type: 'relationship',
          relationTo: 'variant-groups',
          required: true,
        },
        {
          name: 'value',
          label: 'Value',
          type: 'relationship',
          relationTo: 'variant-values',
          required: true,
          filterOptions: ({ siblingData }) => {
            const groupId = getRelationshipId(
              (siblingData as { group?: unknown } | undefined)?.group,
            )
            return filterValuesByGroupId(groupId)
          },
        },
      ],
    },
  ],
}
