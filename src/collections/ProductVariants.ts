import type { CollectionConfig } from 'payload'

import {
  autoTitleProductVariant,
  getProductVariantTypeIds,
  validateProductVariant,
} from '@/lib/productVariantHooks'

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

function emptyRelationshipFilter() {
  // Payload treats `false` as "no filter" (all options). An empty `in` list shows none.
  return { id: { in: [] as number[] } }
}

export const ProductVariants: CollectionConfig = {
  slug: 'product-variants',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'product', '_status'],
    group: 'Catalog',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [validateProductVariant],
    beforeChange: [autoTitleProductVariant],
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated from the selected option values.',
      },
    },
    {
      name: 'options',
      type: 'array',
      labels: {
        singular: 'Option',
        plural: 'Variant Options',
      },
      minRows: 1,
      admin: {
        description:
          'Add one row per variant type assigned to the product. Example: if the product has Size and Color, add two rows — not two rows for the same type.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'type',
          label: 'Variant Type',
          type: 'relationship',
          relationTo: 'variant-types',
          required: true,
          filterOptions: async ({ data, req, siblingData }) => {
            const allowedIds = await getProductVariantTypeIds(data?.product, req)
            if (allowedIds.length === 0) return emptyRelationshipFilter()

            const currentTypeId = getRelationshipId(
              (siblingData as { type?: unknown } | undefined)?.type,
            )
            const usedInOtherRows = new Set<number>()

            for (const row of (data?.options ?? []) as Array<{ type?: unknown }>) {
              const rowTypeId = getRelationshipId(row?.type)
              if (typeof rowTypeId === 'number' && rowTypeId !== currentTypeId) {
                usedInOtherRows.add(rowTypeId)
              }
            }

            const availableIds = allowedIds.filter((id) => !usedInOtherRows.has(id))
            if (availableIds.length === 0) return emptyRelationshipFilter()

            return {
              id: {
                in: availableIds,
              },
            }
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            description:
              'Must match an option defined on the selected variant type (Catalog → Variant Types).',
          },
        },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      labels: {
        singular: 'Image',
        plural: 'Gallery',
      },
      admin: {
        description: 'Images shown when this variant combination is selected on the storefront.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
