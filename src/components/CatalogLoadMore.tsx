'use client'

import { Loader2 } from 'lucide-react'

type CatalogLoadMoreProps = {
  isLoading: boolean
  hasMore: boolean
}

export function CatalogLoadMore({ isLoading, hasMore }: CatalogLoadMoreProps) {
  if (!isLoading || !hasMore) return null

  return (
    <div
      className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Loading more products...
    </div>
  )
}
