'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import type { Category } from '@/payload-types'
import type { CatalogFilterOptions } from '@/lib/catalogFilterTypes'
import { ProductCard, type ProductWithStats } from '@/components/ProductCard'
import { ProductCardGrid } from '@/components/ProductCardGrid'
import { CatalogLoadMore } from '@/components/CatalogLoadMore'
import { InfiniteScrollSentinel } from '@/components/InfiniteScrollSentinel'
import { buildCatalogSearchUrl, catalogSortToLabel, type CatalogSort } from '@/lib/catalogUrl'
import { buildSearchPathFromSnapshot } from '@/lib/catalogFilterParams'
import { useCatalogFilterState } from '@/hooks/useCatalogFilterState'
import { useInfiniteCatalog } from '@/hooks/useInfiniteCatalog'
import { useFilterSheet } from '@/context/FilterSheetContext'

const FilterSheet = dynamic(() =>
  import('@/components/FilterSheet').then((mod) => ({ default: mod.FilterSheet })),
)
const SortSheet = dynamic(() =>
  import('@/components/SortSheet').then((mod) => ({ default: mod.SortSheet })),
)

interface FrontPageCatalogProps {
  categories: Category[]
  brands: string[]
  filterOptions: CatalogFilterOptions
  initialProducts: ProductWithStats[]
  initialTotalDocs: number
}

export function FrontPageCatalog({
  categories,
  brands,
  filterOptions,
  initialProducts,
  initialTotalDocs,
}: FrontPageCatalogProps) {
  const router = useRouter()
  const [isSortOpen, setIsSortOpen] = React.useState(false)
  const [selectedSort, setSelectedSort] = React.useState<CatalogSort>('popular')
  const { closeFilter } = useFilterSheet()
  const filters = useCatalogFilterState({
    initialTotalDocs,
  })

  const catalog = useInfiniteCatalog<ProductWithStats>({
    filters: filters.appliedFilters,
    sort: selectedSort,
    initialDocs: initialProducts,
    initialTotalDocs,
    seedFromInitialWhenUnfiltered: true,
  })

  const isCatalogLoading = catalog.isInitialLoading || filters.isLoading

  return (
    <>
      <section id="home-catalog-results" className="scroll-mt-24 px-4 pb-20 pt-6 md:pb-12 md:pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between border-t border-border pt-6">
            <div>
              <h2 className="font-serif text-xl text-white sm:text-2xl">All Products</h2>
              <Link
                href={buildCatalogSearchUrl()}
                className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-4"
              >
                Browse / Filter Catalog
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setIsSortOpen(true)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
            >
              Sort by: {catalogSortToLabel(selectedSort)} <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-6 text-sm text-muted-foreground">
            {isCatalogLoading ? 'Loading...' : `${catalog.totalDocs.toLocaleString()} products`}
          </p>

          {catalog.docs.length === 0 && !isCatalogLoading ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <p className="text-muted-foreground">No products found matching your filters.</p>
            </div>
          ) : (
            <>
              <ProductCardGrid
                className={
                  isCatalogLoading ? 'pointer-events-none opacity-50 transition-opacity' : ''
                }
              >
                {catalog.docs.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductCardGrid>

              <CatalogLoadMore isLoading={catalog.isLoadingMore} hasMore={catalog.hasMore} />
              <InfiniteScrollSentinel
                enabled={catalog.hasMore && !catalog.isInitialLoading && !catalog.isLoadingMore}
                onIntersect={catalog.onIntersect}
              />
            </>
          )}
        </div>
      </section>

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
        handleClearAll={() => {
          filters.handleClearAll()
          closeFilter()
        }}
        onApply={() => {
          closeFilter()
          router.push(`${buildSearchPathFromSnapshot(filters.getFilterSnapshot())}#catalog-results`)
        }}
        totalDocs={filters.totalDocs}
      />

      {isSortOpen ? (
        <SortSheet
          isOpen={isSortOpen}
          value={selectedSort}
          onClose={() => setIsSortOpen(false)}
          onApply={(sort) => {
            setSelectedSort(sort)
            setIsSortOpen(false)
            router.push(buildCatalogSearchUrl({ sort }))
          }}
        />
      ) : null}
    </>
  )
}
