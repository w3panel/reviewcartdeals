'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SelectedVariantFilters } from '@/lib/catalogFilterTypes'
import {
  appendCatalogFiltersToParams,
  type CatalogFilterSnapshot,
  hasActiveCatalogFilters,
  toggleVariantValue,
} from '@/lib/catalogFilterParams'

type CatalogApiResponse<TDoc> = {
  docs: TDoc[]
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

export function useCatalogFilterState<TDoc>(options: {
  initialTotalDocs: number
  initialDocs?: TDoc[]
  initialFilters?: CatalogFilterSnapshot
  debounceMs?: number
}) {
  const { initialTotalDocs, initialDocs, initialFilters, debounceMs = 300 } = options
  const initialDocsRef = useRef(initialDocs)
  initialDocsRef.current = initialDocs

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
  const [docs, setDocs] = useState<TDoc[] | undefined>(initialDocs)
  const [isLoading, setIsLoading] = useState(false)

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
    const hasFilters = hasActiveCatalogFilters({
      q: debouncedSearch,
      categories: selectedCategories,
      brands: selectedBrands,
      specs: selectedSpecs,
      variants: selectedVariants,
    })

    if (!hasFilters) {
      setTotalDocs(initialTotalDocs)
      if (initialDocsRef.current !== undefined) setDocs(initialDocsRef.current)
      return
    }

    const fetchFiltered = async () => {
      if (initialDocsRef.current !== undefined) setIsLoading(true)

      const params = appendCatalogFiltersToParams(new URLSearchParams(), {
        q: debouncedSearch,
        categories: selectedCategories,
        brands: selectedBrands,
        specs: selectedSpecs,
        variants: selectedVariants,
      })

      try {
        const res = await fetch(`/api/products/catalog?${params.toString()}`)
        if (res.ok) {
          const data = (await res.json()) as CatalogApiResponse<TDoc>
          setTotalDocs(data.totalDocs || 0)
          if (initialDocsRef.current !== undefined) setDocs(data.docs || [])
        }
      } catch (err) {
        console.error('Failed to fetch filtered catalog', err)
      } finally {
        if (initialDocsRef.current !== undefined) setIsLoading(false)
      }
    }

    fetchFiltered()
  }, [
    debouncedSearch,
    selectedCategories,
    selectedBrands,
    selectedSpecs,
    selectedVariants,
    initialTotalDocs,
  ])

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
    totalDocs,
    docs,
    isLoading,
  }
}
