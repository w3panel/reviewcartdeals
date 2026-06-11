import type { CollectionConfig } from 'payload'
import { headersWithCors } from 'payload'
import { formatSlug } from '@/lib/formatSlug'
import { findCatalogProducts } from '@/lib/productFilters'
import { getProductReviewStatsBatch } from '@/services/reviews'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'brand', 'category', 'featured'],
  },
  access: {
    read: () => true,
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
            headers: new Headers(),
            req,
          }),
        })
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
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
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
      name: 'variants',
      type: 'array',
      labels: {
        singular: 'Variant',
        plural: 'Variants',
      },
      admin: {
        description:
          'Optional product options. Shoppers pick a variant before adding to their enquiry.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'attributes',
          type: 'array',
          labels: {
            singular: 'Attribute',
            plural: 'Product Attributes',
          },
          admin: {
            description:
              'Add any attribute-value pairs for this variant, e.g. RAM → 8GB, Storage → 128GB.',
          },
          fields: [
            {
              name: 'key',
              label: 'Attribute',
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
          name: 'gallery',
          type: 'array',
          labels: {
            singular: 'Image',
            plural: 'Gallery',
          },
          admin: {
            description:
              'Optional images for this variant. When selected, these replace the main product gallery.',
            initCollapsed: true,
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
