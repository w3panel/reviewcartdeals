import type { CollectionConfig } from 'payload'
import { headersWithCors } from 'payload'
import { generateProductVariants } from '@/lib/generateProductVariants'
import { validateProductAttributes } from '@/lib/productAttributeHooks'
import {
  syncVariantOptionAvailability,
  validateProductOptionAvailability,
} from '@/lib/productOptionAvailabilityHooks'
import {
  sanitizeVariantVisualGalleriesOnSave,
  syncVariantVisualGalleries,
} from '@/lib/productVisualGalleryHooks'
import { findCatalogProducts } from '@/lib/productFilters'
import { revalidateAfterProductChange, revalidateAfterProductDelete } from '@/lib/revalidateContent'
import { getProductReviewStatsBatch } from '@/services/reviews'
import { getRelationshipId } from '@/lib/variantOptionValues'

function emptyRelationshipFilter() {
  return { id: { in: [] as number[] } }
}

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
      syncVariantOptionAvailability,
      syncVariantVisualGalleries,
      sanitizeVariantVisualGalleriesOnSave,
      validateProductAttributes,
      validateProductOptionAvailability,
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
          'Add as many product images as needed. The first image is used as the listing thumbnail.',
        initCollapsed: false,
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
      name: 'enableVariants',
      type: 'checkbox',
      defaultValue: false,
      label: 'Enable Variants',
      admin: {
        description:
          'Turn on when this product has selectable options such as color or size. Variant Types define the dimensions; Product Variants define purchasable combinations.',
      },
    },
    {
      name: 'variantOptionTypes',
      type: 'relationship',
      relationTo: 'variant-types',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
        description:
          'Global catalog dimensions for this product (e.g. Color, Size). Values come from Variant Option Values and can be reused across products.',
      },
    },
    {
      name: 'variantOptionAvailability',
      type: 'array',
      labels: {
        singular: 'Available Values',
        plural: 'Available Values by Type',
      },
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
        description:
          'Choose which catalog values apply to this product. Save the product (or wait for autosave) after changing variant types so availability rows can synchronize. Empty rows auto-fill with all published values for that type on save.',
        initCollapsed: false,
        components: {
          Field: '@/components/admin/VariantOptionAvailabilityField',
        },
      },
      fields: [
        {
          name: 'type',
          label: 'Variant Type',
          type: 'relationship',
          relationTo: 'variant-types',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'optionValues',
          label: 'Available Values',
          type: 'relationship',
          relationTo: 'variant-option-values',
          hasMany: true,
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
            description: 'Values offered for this product and type (e.g. Blue, Red).',
          },
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
      name: 'variantVisualGalleries',
      type: 'array',
      labels: {
        singular: 'Visual Gallery',
        plural: 'Variant Visual Galleries',
      },
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
        description:
          'Upload product-specific images for each visual option (e.g. each Color). Images are not shared with other products that use the same catalog value. Save the product (or wait for autosave) after changing available values so gallery rows can synchronize.',
        initCollapsed: false,
        isSortable: false,
        components: {
          Field: '@/components/admin/VariantVisualGalleriesField',
          RowLabel: '@/components/admin/VariantVisualGalleryRowLabel',
        },
      },
      fields: [
        {
          name: 'optionValue',
          type: 'relationship',
          relationTo: 'variant-option-values',
          required: true,
          admin: {
            hidden: true,
            readOnly: true,
          },
        },
        {
          name: 'gallery',
          type: 'array',
          minRows: 0,
          labels: {
            singular: 'Image',
            plural: 'Images',
          },
          admin: {
            description: 'Optional. Add images one at a time — none are required.',
            initCollapsed: false,
            components: {
              Field: '@/components/admin/VariantVisualGalleryImagesField',
            },
          },
          fields: [
            {
              name: 'image',
              type: 'relationship',
              relationTo: 'media',
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: 'linkedVariants',
      type: 'join',
      collection: 'product-variants',
      on: 'product',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
        allowCreate: true,
        defaultColumns: ['title', '_status'],
        description:
          'Advanced: inspect or manually edit individual variant combinations. Prefer Generate Variant Combinations above for bulk setup. Product Variants define purchasable combinations only — images live in Variant Visual Galleries above.',
      },
    },
    {
      name: 'productAttributes',
      type: 'array',
      labels: {
        singular: 'Product Attribute',
        plural: 'Product Attributes',
      },
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.enableVariants),
        description:
          'Shared details for every variant (e.g. Fit: Regular). These do not create separate combinations.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'type',
          label: 'Attribute Type',
          type: 'relationship',
          relationTo: 'variant-types',
          required: true,
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
