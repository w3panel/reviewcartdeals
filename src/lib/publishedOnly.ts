import type { Where } from 'payload'

/** Matches published documents once drafts are enabled on a collection. */
export const publishedStatusWhere: Where = {
  or: [{ _status: { equals: 'published' } }, { _status: { exists: false } }],
}

export function withPublishedOnly(where?: Where): Where {
  if (!where) {
    return publishedStatusWhere
  }

  return {
    and: [where, publishedStatusWhere],
  }
}
