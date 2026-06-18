import type { CollectionConfig } from 'payload'

import { emptyRelationshipFilter, getRelationshipId } from '@/lib/relationships'
import {
  ensureVariantValueDraftFields,
  validateVariantValueGroupOnSave,
  validateVariantValueLabelOnSave,
} from '@/lib/variantCatalogHooks'
import { isAutosaveRequest } from '@/lib/isAutosaveRequest'

export const VariantValues: CollectionConfig = {
  slug: 'variant-values',
  labels: {
    singular: 'Variant Value',
    plural: 'Variant Values',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'group', '_status'],
    group: 'Catalog',
    description:
      'Global selectable values (e.g. Blue, Large). Prefer creating from Variant Groups → Linked Values so the group is set automatically.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name (e.g. Navy Blue).',
      },
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'variant-groups',
      index: true,
      admin: {
        description:
          'The variant group this value belongs to. Required before publishing; drafts may be created without a group.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ensureVariantValueDraftFields,
      validateVariantValueLabelOnSave,
      validateVariantValueGroupOnSave,
    ],
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (isAutosaveRequest(req)) return data

        const label = (data?.label ?? originalDoc?.label)?.trim()
        const groupId = getRelationshipId(data?.group ?? originalDoc?.group)
        if (!label || groupId === null) return data

        const existing = await req.payload.find({
          collection: 'variant-values',
          where: {
            and: [
              { group: { equals: groupId } },
              { label: { equals: label } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
        })

        if (existing.docs.length > 0) {
          throw new Error(`"${label}" already exists for this variant group.`)
        }

        return data
      },
    ],
  },
}

export function filterValuesByGroupId(groupId: number | null) {
  if (groupId === null) return emptyRelationshipFilter()
  return {
    group: {
      equals: groupId,
    },
  }
}
