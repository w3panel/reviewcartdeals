import type { CollectionConfig } from 'payload'

import {
  ensureVariantGroupDraftFields,
  validateVariantGroupFieldsOnSave,
} from '@/lib/variantCatalogHooks'

export const VariantGroups: CollectionConfig = {
  slug: 'variant-groups',
  labels: {
    singular: 'Variant Group',
    plural: 'Variant Groups',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'name', 'isVisual', '_status'],
    group: 'Catalog',
    description:
      'Global variant dimensions shared across products (e.g. Color, Size). Create values in Linked Values below, then use them on products.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [ensureVariantGroupDraftFields, validateVariantGroupFieldsOnSave],
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name shown to customers and in the admin (e.g. Color).',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Internal key (lowercase, no spaces). Used for stable references.',
      },
    },
    {
      name: 'isVisual',
      type: 'checkbox',
      label: 'Visual group',
      defaultValue: false,
      admin: {
        description:
          'When enabled, selecting a value from this group can switch the product image gallery on the storefront.',
      },
    },
    {
      name: 'linkedValues',
      type: 'join',
      collection: 'variant-values',
      on: 'group',
      admin: {
        description:
          'Values for this group (e.g. Red, Blue). Create here, publish, then select them on products under Available Values.',
      },
    },
  ],
}
