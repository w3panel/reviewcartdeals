import type {
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'

import { sanitizeWhereIds } from '@/lib/sanitizeWhereIds'
import { getRelationshipId } from '@/lib/variantOptionValues'

const sanitizeDeleteWhere: CollectionBeforeOperationHook = ({ args, operation }) => {
  if (operation !== 'delete' || !args.where) {
    return args
  }

  const where = sanitizeWhereIds(args.where)
  if (!where) {
    throw new Error('No valid documents selected for deletion.')
  }

  return { ...args, where }
}

const validateUniqueOptionValue: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return data

  const variantTypeId = getRelationshipId(data.variantType ?? originalDoc?.variantType)
  const rawValue = typeof data.value === 'string' ? data.value : originalDoc?.value
  const label = typeof rawValue === 'string' ? rawValue.trim() : ''

  if (!variantTypeId) {
    throw new Error('Variant type is required.')
  }

  if (!label) {
    throw new Error('Value is required.')
  }

  const normalized = label.toLowerCase()
  const existing = await req.payload.find({
    collection: 'variant-option-values',
    where: {
      and: [
        { variantType: { equals: variantTypeId } },
        ...(operation === 'update' && originalDoc?.id
          ? [{ id: { not_equals: originalDoc.id } }]
          : []),
      ],
    },
    depth: 0,
    limit: 200,
    overrideAccess: true,
  })

  const duplicate = existing.docs.some(
    (doc) => typeof doc.value === 'string' && doc.value.trim().toLowerCase() === normalized,
  )

  if (duplicate) {
    throw new Error(`"${label}" already exists for this variant type.`)
  }

  data.value = label
  return data
}

export const VariantOptionValues: CollectionConfig = {
  slug: 'variant-option-values',
  admin: {
    useAsTitle: 'value',
    defaultColumns: ['value', 'variantType', '_status'],
    group: 'Catalog',
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: {
      validate: true,
    },
  },
  hooks: {
    beforeOperation: [sanitizeDeleteWhere],
    beforeValidate: [validateUniqueOptionValue],
  },
  fields: [
    {
      name: 'variantType',
      type: 'relationship',
      relationTo: 'variant-types',
      required: true,
      index: true,
      admin: {
        description: 'The variant type this value belongs to (e.g. Color).',
      },
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      admin: {
        description: 'Display value shown in admin and on the storefront, e.g. Red or Black.',
      },
    },
  ],
}
