import type { FieldHook } from 'payload'

import { slugify } from '@/lib/slugify'

export const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return slugify(value)
    }

    const fallbackData = data?.[fallback] ?? originalDoc?.[fallback]

    if (fallbackData && typeof fallbackData === 'string') {
      return slugify(fallbackData)
    }

    return value
  }
