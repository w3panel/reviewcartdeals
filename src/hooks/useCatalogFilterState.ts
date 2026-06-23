'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SelectedVariantFilters } from '@/lib/catalogFilterTypes'
import {
  appendCatalogFiltersToParams,
  type CatalogFilterSnapshot,
  hasActiveCatalogFilters,
  toggleVariantValue,
} from '@/lib/catalogFilterParams'
import { CATALOG_API_PATH } from '@/lib/catalogConstants'

type CatalogCountResponse = {
  totalDocs: number
}

function emptySnapshot(): CatalogFilterSnapshot {
  return {
    q: '',
    categories: [],
    brands: [],
    specs: [],
    variants: {},
  }
}

export function useCatalogFilterState(options: {
  initialTotalDocs: number
  initialFilters?: CatalogFilterSnapshot
  debounceMs?: number
}) {
  const { initialTotalDocs, initialFilters, debounceMs = 300 } = options

  const [searchQuery, setSearchQuery] = useState(initialFilters?.q ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters?.q?.trim() ?? '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories ?? [],
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters?.brands ?? [])
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(initialFilters?.specs ?? [])
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariantFilters>(
    initialFilters?.variants ?? {},
  )
  const [totalDocs, setTotalDocs] = useState(initialTotalDocs)
  const [isLoading, setIsLoading] = useState(false)

  const appliedFilters = useMemo(
    (): CatalogFilterSnapshot => ({
      q: debouncedSearch,
      categories: selectedCategories,
      brands: selectedBrands,
      specs: selectedSpecs,
      variants: selectedVariants,
    }),
    [debouncedSearch, selectedCategories, selectedBrands, selectedSpecs, selectedVariants],
  )

  const getFilterSnapshot = useCallback(
    (): CatalogFilterSnapshot => ({
      q: searchQuery,
      categories: selectedCategories,
      brands: selectedBrands,
      specs: selectedSpecs,
      variants: selectedVariants,
    }),
    [searchQuery, selectedCategories, selectedBrands, selectedSpecs, selectedVariants],
  )

  const applyFilterSnapshot = useCallback((snapshot: CatalogFilterSnapshot) => {
    setSearchQuery(snapshot.q)
    setDebouncedSearch(snapshot.q.trim())
    setSelectedCategories(snapshot.categories)
    setSelectedBrands(snapshot.brands)
    setSelectedSpecs(snapshot.specs)
    setSelectedVariants(snapshot.variants)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), debounceMs)
    return () => clearTimeout(timeout)
  }, [searchQuery, debounceMs])

  useEffect(() => {
    const hasFilters = hasActiveCatalogFilters(appliedFilters)

    if (!hasFilters) {
      setTotalDocs(initialTotalDocs)
      return
    }

    const controller = new AbortController()

    const fetchFilteredCount = async () => {
      setIsLoading(true)

      const params = appendCatalogFiltersToParams(new URLSearchParams(), appliedFilters)
      params.set('limit', '1')
      params.set('page', '1')

      try {
        const res = await fetch(`${CATALOG_API_PATH}?${params.toString()}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = (await res.json()) as CatalogCountResponse
          setTotalDocs(data.totalDocs || 0)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('Failed to fetch filtered catalog count', err)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchFilteredCount()

    return () => controller.abort()
  }, [appliedFilters, initialTotalDocs])

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((entry) => entry !== slug) : [...prev, slug],
    )
  }

  const toggleBrand = (brandTitle: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandTitle) ? prev.filter((b) => b !== brandTitle) : [...prev, brandTitle],
    )
  }

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((entry) => entry !== spec) : [...prev, spec],
    )
  }

  const handleClearAll = () => {
    applyFilterSnapshot(emptySnapshot())
  }

  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    selectedBrands,
    setSelectedBrands,
    selectedSpecs,
    selectedVariants,
    setSelectedVariants,
    toggleCategory,
    toggleBrand,
    toggleSpec,
    toggleVariantValue: (groupId: number, valueId: number) =>
      setSelectedVariants((prev) => toggleVariantValue(prev, groupId, valueId)),
    handleClearAll,
    getFilterSnapshot,
    applyFilterSnapshot,
    appliedFilters,
    totalDocs,
    isLoading,
  }
}
