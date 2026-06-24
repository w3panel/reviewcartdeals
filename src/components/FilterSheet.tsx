'use client'

import React, { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { CatalogFilterFields, countCatalogFilterSelections } from '@/components/CatalogFilterFields'
import type { CatalogFilterOptions, SelectedVariantFilters } from '@/lib/catalogFilterTypes'
import { toggleVariantValue } from '@/lib/catalogFilterParams'
import type { Category } from '@/payload-types'
import { useFilterSheet } from '@/context/FilterSheetContext'

interface FilterSheetProps {
  categories: Category[]
  brands: string[]
  filterOptions: CatalogFilterOptions
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  toggleCategory: (slug: string) => void
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  toggleBrand: (brand: string) => void
  selectedSpecs: string[]
  toggleSpec: (spec: string) => void
  selectedVariants: SelectedVariantFilters
  setSelectedVariants: (variants: SelectedVariantFilters) => void
  handleClearAll: () => void
  onApply?: () => void
  totalDocs: number
}

export function FilterSheet({
  categories,
  brands,
  filterOptions,
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  toggleCategory,
  selectedBrands,
  setSelectedBrands,
  toggleBrand,
  selectedSpecs,
  toggleSpec,
  selectedVariants,
  setSelectedVariants,
  handleClearAll,
  onApply,
  totalDocs,
}: FilterSheetProps) {
  const { isOpen, closeFilter } = useFilterSheet()

  const activeFilterCount = countCatalogFilterSelections({
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedSpecs,
    selectedVariants,
  })

  const categoryLabelBySlug = useMemo(
    () =>
      Object.fromEntries(
        categories
          .filter((category) => category.slug)
          .map((category) => [category.slug as string, category.title]),
      ),
    [categories],
  )

  const variantLabelById = useMemo(() => {
    const map = new Map<number, string>()
    for (const group of filterOptions.variantGroups) {
      for (const value of group.values) {
        map.set(value.id, `${group.label}: ${value.label}`)
      }
    }
    return map
  }, [filterOptions.variantGroups])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={closeFilter}
            className="rounded-full p-2 text-white transition-colors hover:bg-surface"
            aria-label="Close filters"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="font-serif text-2xl text-white">Filters</h2>
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Clear All
        </button>
      </div>

      <div className="luxury-panel flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="mx-auto max-w-2xl">
          <CatalogFilterFields
            categories={categories}
            brands={brands}
            filterOptions={filterOptions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            selectedSpecs={selectedSpecs}
            toggleSpec={toggleSpec}
            selectedVariants={selectedVariants}
            setSelectedVariants={setSelectedVariants}
          />

          {activeFilterCount > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  &ldquo;{searchQuery.trim()}&rdquo; ×
                </button>
              ) : null}
              {selectedCategories.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggleCategory(slug)}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {categoryLabelBySlug[slug] ?? slug} ×
                </button>
              ))}
              {selectedBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {brand} ×
                </button>
              ))}
              {selectedSpecs.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {spec} ×
                </button>
              ))}
              {Object.entries(selectedVariants).flatMap(([groupId, valueIds]) =>
                valueIds.map((valueId) => (
                  <button
                    key={`${groupId}-${valueId}`}
                    type="button"
                    onClick={() =>
                      setSelectedVariants(
                        toggleVariantValue(selectedVariants, Number(groupId), valueId),
                      )
                    }
                    className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {variantLabelById.get(valueId) ?? valueId} ×
                  </button>
                )),
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border bg-black p-4 pb-safe">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => {
              onApply?.()
            }}
            className="w-full rounded-full border border-primary bg-transparent px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
          >
            Apply Filters ({totalDocs.toLocaleString()})
          </button>
        </div>
      </div>
    </div>
  )
}
