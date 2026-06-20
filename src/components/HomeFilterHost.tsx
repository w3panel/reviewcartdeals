'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import type { Category } from '@/payload-types'
import type { CatalogFilterOptions } from '@/lib/catalogFilterTypes'
import { buildSearchPathFromSnapshot } from '@/lib/catalogFilterParams'
import { useCatalogFilterState } from '@/hooks/useCatalogFilterState'
import { useFilterSheet } from '@/context/FilterSheetContext'

const FilterSheet = dynamic(() =>
  import('@/components/FilterSheet').then((mod) => ({ default: mod.FilterSheet })),
)

type HomeFilterHostProps = {
  categories: Category[]
  brands: string[]
  filterOptions: CatalogFilterOptions
  initialTotalDocs: number
}

export function HomeFilterHost({
  categories,
  brands,
  filterOptions,
  initialTotalDocs,
}: HomeFilterHostProps) {
  const router = useRouter()
  const { closeFilter } = useFilterSheet()
  const filters = useCatalogFilterState({ initialTotalDocs })

  const handleApply = () => {
    router.push(buildSearchPathFromSnapshot(filters.getFilterSnapshot()))
    closeFilter()
  }

  const handleClearAll = () => {
    filters.handleClearAll()
    router.push('/search')
    closeFilter()
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
