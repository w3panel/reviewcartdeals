'use client'

import React, { useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/payload-types'
import type { CatalogFilterOptions } from '@/lib/catalogFilterTypes'
import { buildSearchPathFromSnapshot, snapshotFromSearchParamsKey } from '@/lib/catalogFilterParams'
import { useCatalogFilterState } from '@/hooks/useCatalogFilterState'
import { useFilterSheet } from '@/context/FilterSheetContext'
import { FilterSheet } from '@/components/FilterSheet'

type SearchFilterHostProps = {
  categories: Category[]
  brands: string[]
  filterOptions: CatalogFilterOptions
  initialTotalDocs: number
}

function scrollToCatalogResults() {
  requestAnimationFrame(() => {
    document
      .getElementById('catalog-results')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

export function SearchFilterHost({
  categories,
  brands,
  filterOptions,
  initialTotalDocs,
}: SearchFilterHostProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { closeFilter } = useFilterSheet()
  const searchParamsKey = searchParams.toString()

  const appliedFilters = useMemo(
    () => snapshotFromSearchParamsKey(searchParamsKey),
    [searchParamsKey],
  )

  const filters = useCatalogFilterState({
    initialTotalDocs,
    initialFilters: appliedFilters,
  })

  const { applyFilterSnapshot } = filters

  useEffect(() => {
    applyFilterSnapshot(snapshotFromSearchParamsKey(searchParamsKey))
  }, [searchParamsKey, applyFilterSnapshot])

  const handleApply = () => {
    const path = buildSearchPathFromSnapshot(filters.getFilterSnapshot())
    closeFilter()
    router.push(`${path}#catalog-results`, { scroll: false })
    scrollToCatalogResults()
  }

  const handleClearAll = () => {
    filters.handleClearAll()
    closeFilter()
    router.push('/search#catalog-results', { scroll: false })
    scrollToCatalogResults()
  }

  return (
    <FilterSheet
      categories={categories}
      brands={brands}
      filterOptions={filterOptions}
      searchQuery={filters.searchQuery}
      setSearchQuery={filters.setSearchQuery}
      selectedCategories={filters.selectedCategories}
      setSelectedCategories={filters.setSelectedCategories}
      toggleCategory={filters.toggleCategory}
      selectedBrands={filters.selectedBrands}
      setSelectedBrands={filters.setSelectedBrands}
      toggleBrand={filters.toggleBrand}
      selectedSpecs={filters.selectedSpecs}
      toggleSpec={filters.toggleSpec}
      selectedVariants={filters.selectedVariants}
      setSelectedVariants={filters.setSelectedVariants}
      handleClearAll={handleClearAll}
      onApply={handleApply}
      totalDocs={filters.totalDocs}
    />
  )
}
