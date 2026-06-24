'use client'

import React, { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { FilterMultiSelectField } from '@/components/FilterMultiSelectField'
import { FilterSpecToggleGrid } from '@/components/FilterSpecToggleGrid'
import { FilterVariantGroupField } from '@/components/FilterVariantGroupField'
import type { CatalogFilterOptions, SelectedVariantFilters } from '@/lib/catalogFilterTypes'
import { toggleVariantValue } from '@/lib/catalogFilterParams'
import type { Category } from '@/payload-types'

type OpenField = 'category' | 'brand' | null

export type CatalogFilterFieldsProps = {
  categories: Category[]
  brands: string[]
  filterOptions: CatalogFilterOptions
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  selectedSpecs: string[]
  toggleSpec: (spec: string) => void
  selectedVariants: SelectedVariantFilters
  setSelectedVariants: (variants: SelectedVariantFilters) => void
}

export function CatalogFilterFields({
  categories,
  brands,
  filterOptions,
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  selectedBrands,
  setSelectedBrands,
  selectedSpecs,
  toggleSpec,
  selectedVariants,
  setSelectedVariants,
}: CatalogFilterFieldsProps) {
  const [openField, setOpenField] = useState<OpenField>(null)

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.slug)
        .map((category) => ({
          value: category.slug as string,
          label: category.title,
        })),
    [categories],
  )

  const brandOptions = useMemo(
    () => brands.map((brand) => ({ value: brand, label: brand })),
    [brands],
  )

  const toggleField = (field: Exclude<OpenField, null>) => {
    setOpenField((current) => (current === field ? null : field))
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Search
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-muted-foreground transition-colors focus:border-primary/70 focus:outline-none focus:ring-1 focus:ring-primary/25"
          />
        </div>
      </div>

      <FilterMultiSelectField
        label="Category"
        values={selectedCategories}
        placeholder="All Categories"
        options={categoryOptions}
        isOpen={openField === 'category'}
        onToggle={() => toggleField('category')}
        onChange={setSelectedCategories}
        searchPlaceholder="Search categories..."
      />

      <FilterMultiSelectField
        label="Brand"
        values={selectedBrands}
        placeholder="All Brands"
        options={brandOptions}
        isOpen={openField === 'brand'}
        onToggle={() => toggleField('brand')}
        onChange={setSelectedBrands}
        searchPlaceholder="Search brands..."
      />

      {filterOptions.variantGroups.map((group) => {
        const selectedValueIds = selectedVariants[group.id] ?? []

        return (
          <FilterVariantGroupField
            key={group.id}
            group={group}
            selectedValueIds={selectedValueIds}
            onToggleValue={(valueId) =>
              setSelectedVariants(toggleVariantValue(selectedVariants, group.id, valueId))
            }
          />
        )
      })}

      <FilterSpecToggleGrid
        features={filterOptions.specFeatures}
        selected={selectedSpecs}
        onToggle={toggleSpec}
      />
    </div>
  )
}

export function countCatalogFilterSelections(options: {
  searchQuery: string
  selectedCategories: string[]
  selectedBrands: string[]
  selectedSpecs: string[]
  selectedVariants: SelectedVariantFilters
}): number {
  const variantCount = Object.values(options.selectedVariants).reduce(
    (total, valueIds) => total + valueIds.length,
    0,
  )

  return (
    (options.searchQuery.trim() ? 1 : 0) +
    options.selectedCategories.length +
    options.selectedBrands.length +
    options.selectedSpecs.length +
    variantCount
  )
}
