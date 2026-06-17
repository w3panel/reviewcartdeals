import type { CollectionConfig } from 'payload'

import {
  revalidateAfterCategoryChange,
  revalidateAfterCategoryDelete,
} from '@/lib/revalidateContent'

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
