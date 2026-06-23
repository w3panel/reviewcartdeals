import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { CACHE_TAGS } from '@/lib/cacheTags'
import { isAutosaveRequest } from '@/lib/isAutosaveRequest'

export { isAutosaveRequest }

const REVALIDATE_CONTEXT_KEY = 'skipRevalidation'

/** Only published (or legacy non-draft) documents affect the storefront cache. */
export function isPublishedForRevalidation(
  doc: { _status?: string | null } | null | undefined,
): boolean {
  return doc?._status !== 'draft'
}

export function shouldSkipRevalidation(context: Record<string, unknown> | undefined): boolean {
  return Boolean(context?.[REVALIDATE_CONTEXT_KEY])
}

export function markSkipRevalidation(context: Record<string, unknown>): void {
  context[REVALIDATE_CONTEXT_KEY] = true
}

function revalidateFrontendPaths(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path)
  }
}

export const revalidateAfterProductChange: CollectionAfterChangeHook = ({ doc, context, req }) => {
  if (
    isAutosaveRequest(req) ||
    shouldSkipRevalidation(context) ||
    !isPublishedForRevalidation(doc)
  ) {
    return doc
  }

  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.reviews, 'max')
  revalidateTag(CACHE_TAGS.lookups, 'max')

  if (doc?.slug) {
    revalidatePath(`/product/${doc.slug}`)
  }

  revalidateFrontendPaths(['/', '/search'])
  return doc
}

export const revalidateAfterProductDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (shouldSkipRevalidation(context) || !isPublishedForRevalidation(doc)) return doc

  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.reviews, 'max')

  if (doc?.slug) {
    revalidatePath(`/product/${doc.slug}`)
  }

  revalidateFrontendPaths(['/', '/search'])
  return doc
}

export const revalidateAfterCategoryChange: CollectionAfterChangeHook = ({ doc, context, req }) => {
  if (
    isAutosaveRequest(req) ||
    shouldSkipRevalidation(context) ||
    !isPublishedForRevalidation(doc)
  ) {
    return doc
  }

  revalidateTag(CACHE_TAGS.categories, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.lookups, 'max')

  if (doc?.slug) {
    revalidatePath(`/category/${doc.slug}`)
  }

  revalidatePath('/category')
  revalidateFrontendPaths(['/'])
  return doc
}

export const revalidateAfterCategoryDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (shouldSkipRevalidation(context) || !isPublishedForRevalidation(doc)) return doc

  revalidateTag(CACHE_TAGS.categories, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.lookups, 'max')

  if (doc?.slug) {
    revalidatePath(`/category/${doc.slug}`)
  }

  revalidatePath('/category')
  revalidateFrontendPaths(['/'])
  return doc
}

export const revalidateAfterBrandChange: CollectionAfterChangeHook = ({ doc, context, req }) => {
  if (
    isAutosaveRequest(req) ||
    shouldSkipRevalidation(context) ||
    !isPublishedForRevalidation(doc)
  ) {
    return doc
  }

  revalidateTag(CACHE_TAGS.brands, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.lookups, 'max')

  revalidateFrontendPaths(['/', '/search'])
  return doc
}

export const revalidateAfterBrandDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (shouldSkipRevalidation(context) || !isPublishedForRevalidation(doc)) return doc

  revalidateTag(CACHE_TAGS.brands, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateTag(CACHE_TAGS.lookups, 'max')

  revalidateFrontendPaths(['/', '/search'])
  return doc
}

export const revalidateAfterReviewChange: CollectionAfterChangeHook = ({ doc, context, req }) => {
  if (
    isAutosaveRequest(req) ||
    shouldSkipRevalidation(context) ||
    !isPublishedForRevalidation(doc)
  ) {
    return doc
  }

  revalidateTag(CACHE_TAGS.reviews, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateFrontendPaths(['/'])
  return doc
}

export const revalidateAfterReviewDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (shouldSkipRevalidation(context) || !isPublishedForRevalidation(doc)) return doc

  revalidateTag(CACHE_TAGS.reviews, 'max')
  revalidateTag(CACHE_TAGS.products, 'max')
  revalidateFrontendPaths(['/'])
  return doc
}

export const revalidateAfterNavChange: CollectionAfterChangeHook = ({ doc, context, req }) => {
  if (isAutosaveRequest(req) || shouldSkipRevalidation(context)) return doc

  revalidateTag(CACHE_TAGS.nav, 'max')
  revalidatePath('/', 'layout')
  return doc
}

export const revalidateAfterNavDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (shouldSkipRevalidation(context)) return doc

  revalidateTag(CACHE_TAGS.nav, 'max')
  revalidatePath('/', 'layout')
  return doc
}
