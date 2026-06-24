import type { CollectionConfig } from 'payload'
import { headersWithCors } from 'payload'

import {
  revalidateAfterCategoryChange,
  revalidateAfterCategoryDelete,
} from '@/lib/revalidateContent'
import { CATEGORY_PAGE_SIZE } from '@/lib/catalogConstants'
import { findCatalogCategories } from '@/lib/categoryCatalog'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateAfterCategoryChange],
    afterDelete: [revalidateAfterCategoryDelete],
  },
  endpoints: [
    {
      path: '/catalog',
      method: 'get',
      handler: async (req) => {
        const { searchParams } = new URL(req.url!)
        const page = Number(searchParams.get('page') || '1') || 1
        const requestedLimit = Number(searchParams.get('limit') || String(CATEGORY_PAGE_SIZE))
        const limit = Number.isFinite(requestedLimit)
          ? Math.min(Math.max(1, requestedLimit), 50)
          : CATEGORY_PAGE_SIZE

        const result = await findCatalogCategories(req.payload, { page, limit })

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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
  ],
}
