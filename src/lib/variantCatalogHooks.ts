import type { CollectionBeforeChangeHook } from 'payload'

import { isAutosaveRequest } from '@/lib/isAutosaveRequest'
import { getRelationshipId } from '@/lib/relationships'
import { slugify } from '@/lib/slugify'

const DEFAULT_GROUP_LABEL = 'New variant group'
const DEFAULT_VALUE_LABEL = 'New variant value'

async function resolveUniqueVariantGroupName(
  req: Parameters<CollectionBeforeChangeHook>[0]['req'],
  baseLabel: string,
  excludeId?: number | string,
): Promise<string> {
  const base = slugify(baseLabel) || 'variant-group'
  let suffix = 0

  while (suffix < 1000) {
    const name = suffix === 0 ? base : `${base}-${suffix}`
    const existing = await req.payload.find({
      collection: 'variant-groups',
      where: {
        and: [
          { name: { equals: name } },
          ...(excludeId != null ? [{ id: { not_equals: excludeId } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length === 0) return name
    suffix += 1
  }

  return `${base}-${Date.now()}`
}

/** Payload relationship drawers create draft rows before required fields are filled. */
export const ensureVariantGroupDraftFields: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const label = typeof data.label === 'string' ? data.label.trim() : ''
  const name = typeof data.name === 'string' ? data.name.trim() : ''

  if (!label) {
    data.label = originalDoc?.label ?? DEFAULT_GROUP_LABEL
  }

  const resolvedLabel =
    typeof data.label === 'string' && data.label.trim() ? data.label.trim() : DEFAULT_GROUP_LABEL

  if (!name) {
    data.name = await resolveUniqueVariantGroupName(req, resolvedLabel, originalDoc?.id)
  }

  return data
}

export const ensureVariantValueDraftFields: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  if (!data) return data

  const label = typeof data.label === 'string' ? data.label.trim() : ''
  if (!label) {
    data.label = originalDoc?.label ?? DEFAULT_VALUE_LABEL
  }

  return data
}

export const validateVariantGroupFieldsOnSave: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (isAutosaveRequest(req)) return data

  const status = data?._status ?? originalDoc?._status
  if (status !== 'published') return data

  const label = (data?.label ?? originalDoc?.label)?.trim()
  const name = (data?.name ?? originalDoc?.name)?.trim()

  if (!label || label === DEFAULT_GROUP_LABEL) {
    throw new Error('Variant groups require a display label before publishing.')
  }

  if (!name) {
    throw new Error('Variant groups require an internal name before publishing.')
  }

  return data
}

export const validateVariantValueLabelOnSave: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (isAutosaveRequest(req)) return data

  const status = data?._status ?? originalDoc?._status
  if (status !== 'published') return data

  const label = (data?.label ?? originalDoc?.label)?.trim()
  if (!label || label === DEFAULT_VALUE_LABEL) {
    throw new Error('Variant values require a display label before publishing.')
  }

  return data
}

export const validateVariantValueGroupOnSave: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (isAutosaveRequest(req)) return data

  const status = data?._status ?? originalDoc?._status
  if (status !== 'published') return data

  const groupId = getRelationshipId(data?.group ?? originalDoc?.group)
  if (groupId === null) {
    throw new Error('Variant values require a variant group before publishing.')
  }

  return data
}
