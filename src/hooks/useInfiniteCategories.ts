'use client'

import { useCallback, useRef, useState } from 'react'
import { CATEGORIES_API_PATH, CATEGORY_PAGE_SIZE } from '@/lib/catalogConstants'
import type { CatalogPageResponse } from '@/hooks/useInfiniteCatalog'

type UseInfiniteCategoriesOptions<TDoc extends { id: string | number }> = {
  initialDocs: TDoc[]
  initialTotalDocs: number
}

function appendUniqueDocs<TDoc extends { id: string | number }>(
  existing: TDoc[],
  incoming: TDoc[],
): TDoc[] {
  if (incoming.length === 0) return existing

  const seen = new Set(existing.map((doc) => doc.id))
  const unique = incoming.filter((doc) => !seen.has(doc.id))
  return unique.length > 0 ? [...existing, ...unique] : existing
}

function hasMoreCategories(loadedCount: number, totalDocs: number, hasNextPage?: boolean): boolean {
  if (typeof hasNextPage === 'boolean') return hasNextPage
  return loadedCount < totalDocs
}

export function useInfiniteCategories<TDoc extends { id: string | number }>({
  initialDocs,
  initialTotalDocs,
}: UseInfiniteCategoriesOptions<TDoc>) {
  const [docs, setDocs] = useState(initialDocs)
  const [totalDocs, setTotalDocs] = useState(initialTotalDocs)
  const [hasMore, setHasMore] = useState(() =>
    hasMoreCategories(initialDocs.length, initialTotalDocs),
  )
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const pageRef = useRef(1)
  const hasMoreRef = useRef(hasMore)
  const loadingMoreRef = useRef(false)

  hasMoreRef.current = hasMore

  const fetchPage = useCallback(async (pageNumber: number, signal: AbortSignal) => {
    const params = new URLSearchParams({
      page: String(pageNumber),
      limit: String(CATEGORY_PAGE_SIZE),
    })

    const response = await fetch(`${CATEGORIES_API_PATH}?${params.toString()}`, { signal })

    if (!response.ok) {
      throw new Error('Failed to fetch categories page')
    }

    return (await response.json()) as CatalogPageResponse<TDoc>
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMoreRef.current) return

    loadingMoreRef.current = true
    setIsLoadingMore(true)

    const nextPage = pageRef.current + 1
    const controller = new AbortController()

    try {
      const data = await fetchPage(nextPage, controller.signal)

      setDocs((current) => {
        const nextDocs = appendUniqueDocs(current, data.docs ?? [])
        setHasMore(hasMoreCategories(nextDocs.length, data.totalDocs ?? 0, data.hasNextPage))
        return nextDocs
      })
      setTotalDocs(data.totalDocs ?? 0)
      pageRef.current = data.page ?? nextPage
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.error('Failed to load more categories', error)
    } finally {
      loadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }, [fetchPage])

  const handleIntersect = useCallback(() => {
    void loadMore()
  }, [loadMore])

  return {
    docs,
    totalDocs,
    hasMore,
    isLoadingMore,
    onIntersect: handleIntersect,
  }
}
