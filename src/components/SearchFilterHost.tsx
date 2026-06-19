'use client'

import React, { useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/payload-types'
import type { CatalogFilterOptions } from '@/lib/catalogFilterTypes'
import { buildSearchPathFromSnapshot, snapshotFromSearchParams } from '@/lib/catalogFilterParams'
import { useCatalogFilterState } from '@/hooks/useCatalogFilterState'
import { useFilterSheet } from '@/context/FilterSheetContext'

const FilterSheet = dynamic(() =>
  import('@/components/FilterSheet').then((mod) => ({ default: mod.FilterSheet })),
)

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

  const appliedFilters = useMemo(() => snapshotFromSearchParams(searchParams), [searchParams])

  const filters = useCatalogFilterState({
    initialTotalDocs,
    initialFilters: appliedFilters,
  })

  const { applyFilterSnapshot } = filters

  useEffect(() => {
    applyFilterSnapshot(appliedFilters)
  }, [appliedFilters, applyFilterSnapshot])

  const handleApply = () => {
    router.push(buildSearchPathFromSnapshot(filters.getFilterSnapshot()))
    closeFilter()
    scrollToCatalogResults()
  }

  const handleClearAll = () => {
    filters.handleClearAll()
    router.push('/search')
    closeFilter()
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
