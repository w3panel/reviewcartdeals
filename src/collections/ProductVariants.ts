import type { CollectionConfig, FilterOptionsProps } from 'payload'

import { autoTitleProductVariant, validateProductVariant } from '@/lib/productVariantHooks'

async function getProductVariantTypeIds(
  product: unknown,
  req: FilterOptionsProps['req'],
): Promise<number[]> {
  const productId =
    typeof product === 'number'
      ? product
      : typeof product === 'object' && product !== null && 'id' in product
        ? (product as { id: number }).id
        : null

  if (!productId) return []

  const doc = await req.payload.findByID({
    collection: 'products',
    id: productId,
    depth: 0,
    overrideAccess: true,
  })

  const variantTypes = doc.variantTypes ?? []
  return variantTypes
    .map((entry) => (typeof entry === 'number' ? entry : entry?.id))
    .filter((id): id is number => typeof id === 'number')
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
        description: 'One row per variant type on the product, e.g. Color = Red, Size = XL.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'type',
          label: 'Variant Type',
          type: 'relationship',
          relationTo: 'variant-types',
          required: true,
          filterOptions: async ({ data, req }) => {
            const allowedIds = await getProductVariantTypeIds(data?.product, req)
            if (allowedIds.length === 0) return false
            return {
              id: {
                in: allowedIds,
              },
            }
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
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
