'use client'

<<<<<<< HEAD
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import type { ProductWithStats } from '@/components/ProductReviewCard'
import { ProductReviewCard } from '@/components/ProductReviewCard'
import { buildCatalogSearchUrl, catalogSortToLabel, type CatalogSort } from '@/lib/catalogUrl'
=======
import React from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import type { Category } from '@/payload-types'
import type { CatalogFilterOptions } from '@/lib/catalogFilterTypes'
import { ProductReviewCard, type ProductWithStats } from '@/components/ProductReviewCard'
import { useCatalogFilterState } from '@/hooks/useCatalogFilterState'
import { useFilterSheet } from '@/context/FilterSheetContext'
>>>>>>> 8ddc32c (enhanced filteres option)

const SortSheet = dynamic(() =>
  import('@/components/SortSheet').then((mod) => ({ default: mod.SortSheet })),
)

interface FrontPageCatalogProps {
<<<<<<< HEAD
=======
  categories: Category[]
  brands: string[]
  filterOptions: CatalogFilterOptions
>>>>>>> 8ddc32c (enhanced filteres option)
  initialProducts: ProductWithStats[]
  initialTotalDocs: number
}

<<<<<<< HEAD
export function FrontPageCatalog({ initialProducts, initialTotalDocs }: FrontPageCatalogProps) {
  const router = useRouter()
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [selectedSort, setSelectedSort] = useState<CatalogSort>('popular')
=======
export function FrontPageCatalog({
  categories,
  brands,
  filterOptions,
  initialProducts,
  initialTotalDocs,
}: FrontPageCatalogProps) {
  const [isSortOpen, setIsSortOpen] = React.useState(false)
  const { closeFilter } = useFilterSheet()
  const filters = useCatalogFilterState({
    initialTotalDocs,
    initialDocs: initialProducts,
  })

  const products = filters.docs ?? initialProducts
>>>>>>> 8ddc32c (enhanced filteres option)

  return (
    <>
      <section className="px-4 pb-20 pt-2 md:pb-12">
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

          <p className="mb-4 text-sm text-muted-foreground">
<<<<<<< HEAD
            {initialTotalDocs.toLocaleString()} products
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {initialProducts.map((product) => (
              <ProductReviewCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

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
=======
            {filters.isLoading ? 'Loading...' : `${filters.totalDocs.toLocaleString()} products`}
          </p>

          {products.length === 0 && !filters.isLoading ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <p className="text-muted-foreground">No products found matching your filters.</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                filters.isLoading ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {products.map((product) => (
                <ProductReviewCard key={product.id} product={product} />
              ))}
            </div>
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
        handleClearAll={filters.handleClearAll}
        onApply={() => closeFilter()}
        totalDocs={filters.totalDocs}
      />

      {isSortOpen && <SortSheet isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} />}
>>>>>>> 8ddc32c (enhanced filteres option)
    </>
  )
}
