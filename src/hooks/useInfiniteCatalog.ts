'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  appendCatalogFiltersToParams,
  hasActiveCatalogFilters,
  serializeVariantsParam,
  type CatalogFilterSnapshot,
} from '@/lib/catalogFilterParams'
import { CATALOG_API_PATH, CATALOG_PAGE_SIZE } from '@/lib/catalogConstants'
import type { CatalogSort } from '@/lib/catalogUrl'

export type CatalogPageResponse<TDoc> = {
  docs: TDoc[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
}

type UseInfiniteCatalogOptions<TDoc extends { id: string | number }> = {
  filters: CatalogFilterSnapshot
  sort?: CatalogSort
  initialDocs?: TDoc[]
  initialTotalDocs: number
  /** Reuse SSR page-1 data when no filters are active instead of refetching. */
  seedFromInitialWhenUnfiltered?: boolean
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

function hasMoreProducts(loadedCount: number, totalDocs: number, hasNextPage?: boolean): boolean {
  if (typeof hasNextPage === 'boolean') return hasNextPage
  return loadedCount < totalDocs
}

export function useInfiniteCatalog<TDoc extends { id: string | number }>({
  filters,
  sort = 'popular',
  initialDocs,
  initialTotalDocs,
  seedFromInitialWhenUnfiltered = false,
}: UseInfiniteCatalogOptions<TDoc>) {
  const initialDocsRef = useRef(initialDocs)
  initialDocsRef.current = initialDocs

  const filtersActive = hasActiveCatalogFilters({
    q: filters.q,
    categories: filters.categories,
    brands: filters.brands,
    specs: filters.specs,
    variants: filters.variants,
  })

  const variantsKey = serializeVariantsParam(filters.variants)
  const categoriesKey = filters.categories.join(',')
  const brandsKey = filters.brands.join(',')
  const specsKey = filters.specs.join(',')

  const queryKey = useMemo(() => {
    const params = appendCatalogFiltersToParams(new URLSearchParams(), {
      q: filters.q,
      categories: filters.categories,
      brands: filters.brands,
      specs: filters.specs,
      variants: filters.variants,
      sort,
      page: 1,
    })
    params.set('limit', String(CATALOG_PAGE_SIZE))
    return params.toString()
  }, [filters.q, categoriesKey, brandsKey, specsKey, variantsKey, sort])

  const [docs, setDocs] = useState<TDoc[]>(initialDocs ?? [])
  const [totalDocs, setTotalDocs] = useState(initialTotalDocs)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(() =>
    hasMoreProducts(initialDocs?.length ?? 0, initialTotalDocs),
  )
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const requestGenerationRef = useRef(0)
  const loadingMoreRef = useRef(false)
  const pageRef = useRef(1)
  const hasMoreRef = useRef(hasMore)
  const isInitialLoadingRef = useRef(isInitialLoading)

  pageRef.current = page
  hasMoreRef.current = hasMore
  isInitialLoadingRef.current = isInitialLoading

  const buildParams = useCallback(
    (pageNumber: number) => {
      const params = appendCatalogFiltersToParams(new URLSearchParams(), {
        q: filters.q,
        categories: filters.categories,
        brands: filters.brands,
        specs: filters.specs,
        variants: filters.variants,
        sort,
        page: pageNumber,
      })
      params.set('limit', String(CATALOG_PAGE_SIZE))
      return params
    },
    [filters, sort],
  )

  const fetchPage = useCallback(
    async (pageNumber: number, signal: AbortSignal) => {
      const response = await fetch(`${CATALOG_API_PATH}?${buildParams(pageNumber).toString()}`, {
        signal,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch catalog page')
      }

      return (await response.json()) as CatalogPageResponse<TDoc>
    },
    [buildParams],
  )

  const resetToInitial = useCallback(() => {
    const seededDocs = initialDocsRef.current ?? []
    setDocs(seededDocs)
    setTotalDocs(initialTotalDocs)
    setPage(1)
    pageRef.current = 1
    setHasMore(hasMoreProducts(seededDocs.length, initialTotalDocs))
  }, [initialTotalDocs])

  useEffect(() => {
    requestGenerationRef.current += 1
    loadingMoreRef.current = false
    setIsLoadingMore(false)

    const generation = requestGenerationRef.current
    const controller = new AbortController()

    if (seedFromInitialWhenUnfiltered && !filtersActive && initialDocsRef.current) {
      resetToInitial()
      setIsInitialLoading(false)
      return () => controller.abort()
    }

    const loadFirstPage = async () => {
      setIsInitialLoading(true)

      try {
        const data = await fetchPage(1, controller.signal)
        if (generation !== requestGenerationRef.current) return

        const nextDocs = data.docs ?? []
        setDocs(nextDocs)
        setTotalDocs(data.totalDocs ?? 0)
        setPage(data.page ?? 1)
        pageRef.current = data.page ?? 1
        setHasMore(hasMoreProducts(nextDocs.length, data.totalDocs ?? 0, data.hasNextPage))
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to fetch catalog', error)
      } finally {
        if (generation === requestGenerationRef.current) {
          setIsInitialLoading(false)
        }
      }
    }

    void loadFirstPage()

    return () => controller.abort()
  }, [queryKey, filtersActive, seedFromInitialWhenUnfiltered, fetchPage, resetToInitial])

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMoreRef.current || isInitialLoadingRef.current) {
      return
    }

    loadingMoreRef.current = true
    setIsLoadingMore(true)

    const generation = requestGenerationRef.current
    const nextPage = pageRef.current + 1
    const controller = new AbortController()

    try {
      const data = await fetchPage(nextPage, controller.signal)
      if (generation !== requestGenerationRef.current) return

      setDocs((current) => {
        const nextDocs = appendUniqueDocs(current, data.docs ?? [])
        setHasMore(hasMoreProducts(nextDocs.length, data.totalDocs ?? 0, data.hasNextPage))
        return nextDocs
      })
      setTotalDocs(data.totalDocs ?? 0)
      setPage(data.page ?? nextPage)
      pageRef.current = data.page ?? nextPage
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      console.error('Failed to load more catalog products', error)
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
    page,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    onLoadMore: loadMore,
    onIntersect: handleIntersect,
  }
}
