import type { CollectionConfig } from 'payload'

import {
  autoTitleProductVariant,
  getProductVariantTypeIds,
  validateProductVariant,
} from '@/lib/productVariantHooks'
import { getRelationshipId } from '@/lib/variantOptionValues'

function emptyRelationshipFilter() {
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
          'Add one row per differentiating variant type (e.g. Color). Pick a catalog option value — free text is not allowed.',
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
          name: 'optionValue',
          label: 'Value',
          type: 'relationship',
          relationTo: 'variant-option-values',
          required: true,
          filterOptions: ({ siblingData }) => {
            const typeId = getRelationshipId((siblingData as { type?: unknown } | undefined)?.type)
            if (typeId === null) return emptyRelationshipFilter()

            return {
              variantType: {
                equals: typeId,
              },
            }
          },
          admin: {
            description:
              'Select a value defined on the variant type. Add new values under Catalog → Variant Option Values.',
          },
        },
      ],
    },
  ],
}
