import type { CollectionConfig } from 'payload'
import { headersWithCors } from 'payload'

import { filterValuesByGroupId } from '@/collections/VariantValues'
import { generateProductVariants } from '@/lib/generateProductVariants'
import { findCatalogProducts } from '@/lib/productFilters'
import { getRelationshipId, emptyRelationshipFilter } from '@/lib/relationships'
import { revalidateAfterProductChange, revalidateAfterProductDelete } from '@/lib/revalidateContent'
import { getProductReviewStatsBatch } from '@/services/reviews'
import {
  preserveProductFieldsOnPartialUpdate,
  sanitizeProductVariantConfig,
  validateProductVariantConfig,
} from '@/lib/variantValidation'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'brand', 'category', 'featured'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      preserveProductFieldsOnPartialUpdate,
      sanitizeProductVariantConfig,
      validateProductVariantConfig,
    ],
    afterChange: [revalidateAfterProductChange],
    afterDelete: [revalidateAfterProductDelete],
  },
  endpoints: [
    {
      path: '/catalog',
      method: 'get',
      handler: async (req) => {
        const { searchParams } = new URL(req.url!)
        const q = searchParams.get('q') || undefined
        const category = searchParams.get('category') || undefined
        const brand = searchParams.get('brand') || undefined
        const page = Number(searchParams.get('page') || '1') || 1

        const result = await findCatalogProducts(req.payload, {
          search: q,
          categorySlug: category === 'ALL' || !category ? undefined : category,
          brand: brand === 'ALL' || !brand ? undefined : brand,
          page,
          limit: 12,
        })

        const statsByProduct = await getProductReviewStatsBatch(
          result.docs.map((prod) => prod.id),
          req.payload,
        )
        result.docs = result.docs.map((prod) => ({
          ...prod,
          stats: statsByProduct.get(prod.id),
        }))

        return Response.json(result, {
          headers: headersWithCors({
            headers: new Headers({
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            }),
            req,
          }),
        })
      },
    },
    {
      path: '/:id/generate-variants',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
        }

        const rawId = req.routeParams?.id
        const productId = typeof rawId === 'string' ? Number(rawId) : Number(rawId ?? NaN)
        if (!Number.isFinite(productId)) {
          return Response.json({ errors: [{ message: 'Invalid product ID.' }] }, { status: 400 })
        }

        try {
          const result = await generateProductVariants(req.payload, productId, req)
          return Response.json(result, {
            headers: headersWithCors({
              headers: new Headers(),
              req,
            }),
          })
        } catch (error) {
          return Response.json(
            {
              errors: [
                {
                  message: error instanceof Error ? error.message : 'Failed to generate variants.',
                },
              ],
            },
            {
              status: 400,
              headers: headersWithCors({
                headers: new Headers(),
                req,
              }),
            },
          )
        }
      },
    },
  ],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Product description shown on listings and the product page.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      labels: {
        singular: 'Gallery',
        plural: 'Gallery',
      },
      admin: {
        description:
          'Default product images. When variants are enabled, use Value Galleries below for visual groups (e.g. Color).',
        initCollapsed: false,
        condition: (_, siblingData) => !siblingData?.enableVariants,
      },
      fields: [
        {
          name: 'image',
          label: 'Image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'limitedEdition',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      type: 'collapsible',
      label: 'Variants',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'variantSetupGuide',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/admin/VariantSetupGuideField',
            },
          },
        },
        {
          name: 'enableVariants',
          type: 'checkbox',
          label: 'Enable Variants',
          defaultValue: false,
          admin: {
            description:
              'Turn on when this product has selectable options (e.g. color or size). Configure groups and values below, then generate combinations.',
          },
        },
        {
          name: 'variantGroupSettings',
          type: 'array',
          labels: {
            singular: 'Variant Group',
            plural: 'Variant Groups (this product)',
          },
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
            description:
              'Product-specific configuration: choose which global variant groups apply and which values are offered.',
            initCollapsed: false,
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
              name: 'values',
              label: 'Available Values',
              type: 'relationship',
              relationTo: 'variant-values',
              hasMany: true,
              required: true,
              filterOptions: ({ siblingData }) => {
                const groupId = getRelationshipId(
                  (siblingData as { group?: unknown } | undefined)?.group,
                )
                return filterValuesByGroupId(groupId)
              },
              admin: {
                allowCreate: false,
                description:
                  'Only pick values that belong to the variant group selected in this row (e.g. Color values on the Color row). If you change the group, clear old values and re-select.',
              },
            },
          ],
        },
        {
          name: 'valueGalleries',
          type: 'array',
          labels: {
            singular: 'Value Gallery',
            plural: 'Value Galleries (this product)',
          },
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
            description:
              'Product-specific images for visual variant values (e.g. each Color). Saving also adds each gallery value to that group’s Available Values if missing.',
            initCollapsed: false,
          },
          fields: [
            {
              name: 'value',
              label: 'Variant Value',
              type: 'relationship',
              relationTo: 'variant-values',
              required: true,
              filterOptions: ({ data }) => {
                const configuredValueIds = new Set<number>()
                const settings = (data as { variantGroupSettings?: Array<{ values?: unknown[] }> })
                  ?.variantGroupSettings

                for (const row of settings ?? []) {
                  for (const value of row.values ?? []) {
                    const valueId = getRelationshipId(value)
                    if (valueId !== null) configuredValueIds.add(valueId)
                  }
                }

                if (configuredValueIds.size === 0) return emptyRelationshipFilter()

                return {
                  id: {
                    in: [...configuredValueIds],
                  },
                }
              },
            },
            {
              name: 'gallery',
              type: 'array',
              labels: {
                singular: 'Image',
                plural: 'Images',
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
        },
        {
          name: 'generateVariants',
          type: 'ui',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
            components: {
              Field: '@/components/admin/GenerateVariantsField',
            },
          },
        },
        {
          name: 'linkedVariants',
          type: 'join',
          collection: 'product-variants',
          on: 'product',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
            allowCreate: false,
            defaultColumns: ['title', 'active', '_status'],
            description:
              'Generated combinations for this product. Use Generate missing combinations above — do not create variants manually here.',
          },
        },
      ],
    },
    {
      name: 'specifications',
      type: 'array',
      labels: {
        singular: 'Specification',
        plural: 'Specifications',
      },
      admin: {
        description: 'Add as many specification rows as needed. Each row is a name/value pair.',
      },
      fields: [
        {
          name: 'key',
          label: 'Name',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          label: 'Value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
  ],
}
