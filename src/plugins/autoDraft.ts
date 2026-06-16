import type { Access, CollectionConfig, Config, Plugin } from 'payload'

import { publishedStatusWhere } from '@/lib/publishedOnly'

export interface AutoDraftPluginOptions {
  /** Extra collection slugs to skip. Auth and upload collections are always skipped. */
  exclude?: string[]
  /** Autosave debounce interval in milliseconds. @default 800 */
  autosaveInterval?: number
  /** Max versions kept per document. @default 50 */
  maxPerDoc?: number
}

function shouldSkipDrafts(collection: CollectionConfig, exclude: Set<string>): boolean {
  if (exclude.has(collection.slug)) {
    return true
  }

  // Auth collections (e.g. users) should not use draft/publish workflow.
  if (collection.auth) {
    return true
  }

  // Upload collections (e.g. media) are created in one step and must stay publicly readable.
  if (collection.upload) {
    return true
  }

  return false
}

function wrapReadAccess(existing?: Access): Access {
  return async (args) => {
    if (args.req.user) {
      if (!existing) {
        return true
      }

      return existing(args)
    }

    if (!existing) {
      return publishedStatusWhere
    }

    const result = await existing(args)

    if (result === false) {
      return false
    }

    if (result === true) {
      return publishedStatusWhere
    }

    return {
      and: [result, publishedStatusWhere],
    }
  }
}

function enableDrafts(
  collection: CollectionConfig,
  options: Required<Pick<AutoDraftPluginOptions, 'autosaveInterval' | 'maxPerDoc'>>,
): CollectionConfig {
  const existingVersions =
    collection.versions === true
      ? {}
      : typeof collection.versions === 'object'
        ? collection.versions
        : {}

  const existingDrafts =
    existingVersions.drafts === true
      ? {}
      : typeof existingVersions.drafts === 'object'
        ? existingVersions.drafts
        : {}

  const defaultColumns = collection.admin?.defaultColumns
  const columnsWithStatus =
    defaultColumns && !defaultColumns.includes('_status')
      ? [...defaultColumns, '_status']
      : defaultColumns

  return {
    ...collection,
    admin:
      collection.admin && columnsWithStatus
        ? {
            ...collection.admin,
            defaultColumns: columnsWithStatus,
          }
        : collection.admin,
    access: {
      ...collection.access,
      read: wrapReadAccess(collection.access?.read),
    },
    versions: {
      ...existingVersions,
      maxPerDoc: existingVersions.maxPerDoc ?? options.maxPerDoc,
      drafts: {
        ...existingDrafts,
        autosave: {
          ...(typeof existingDrafts.autosave === 'object' ? existingDrafts.autosave : {}),
          interval: options.autosaveInterval,
        },
        validate: existingDrafts.validate ?? false,
      },
    },
  }
}

export const autoDraftPlugin =
  (pluginOptions: AutoDraftPluginOptions = {}): Plugin =>
  (config: Config): Config => {
    const exclude = new Set(pluginOptions.exclude ?? [])
    const autosaveInterval = pluginOptions.autosaveInterval ?? 800
    const maxPerDoc = pluginOptions.maxPerDoc ?? 50

    return {
      ...config,
      collections: (config.collections ?? []).map((collection) => {
        if (shouldSkipDrafts(collection, exclude)) {
          return collection
        }

        return enableDrafts(collection, { autosaveInterval, maxPerDoc })
      }),
    }
  }
