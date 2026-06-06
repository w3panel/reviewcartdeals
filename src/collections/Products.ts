import type { CollectionConfig } from 'payload'
import { headersWithCors } from 'payload'
import { formatSlug } from '@/lib/formatSlug'
import { findCatalogProducts } from '@/lib/productFilters'

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
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'fullDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      // Single image, optional
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'specifications',
      type: 'array',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
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
