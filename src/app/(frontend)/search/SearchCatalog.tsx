'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { SafeImage } from '@/components/SafeImage'
import { CatalogFilterFields } from '@/components/CatalogFilterFields'
import { FilterActiveChips } from '@/components/FilterActiveChips'
import { CatalogLoadMore } from '@/components/CatalogLoadMore'
import { InfiniteScrollSentinel } from '@/components/InfiniteScrollSentinel'
import type { CatalogFilterOptions } from '@/lib/catalogFilterTypes'
import {
  buildSearchPathFromSnapshot,
  hasActiveCatalogFilters,
  snapshotFromSearchParams,
} from '@/lib/catalogFilterParams'
import { catalogSortToLabel, parseCatalogSort } from '@/lib/catalogUrl'
import { getImageUrl, getProductBrandTitle, getProductMainImage } from '@/lib/utils'
import type { Product, Category } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'
import { useInfiniteCatalog } from '@/hooks/useInfiniteCatalog'

interface SearchCatalogProps {
  categories: Category[]
  brands: string[]
  filterOptions: CatalogFilterOptions
}

export function SearchCatalog({ categories, brands, filterOptions }: SearchCatalogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const appliedFilters = useMemo(() => snapshotFromSearchParams(searchParams), [searchParams])
  const sort = parseCatalogSort(searchParams.get('sort'))

  const [searchQuery, setSearchQuery] = React.useState(appliedFilters.q)
  const [selectedCategories, setSelectedCategories] = React.useState(appliedFilters.categories)
  const [selectedBrands, setSelectedBrands] = React.useState(appliedFilters.brands)
  const [selectedSpecs, setSelectedSpecs] = React.useState(appliedFilters.specs)
  const [selectedVariants, setSelectedVariants] = React.useState(appliedFilters.variants)

  React.useEffect(() => {
    setSearchQuery(appliedFilters.q)
    setSelectedCategories(appliedFilters.categories)
    setSelectedBrands(appliedFilters.brands)
    setSelectedSpecs(appliedFilters.specs)
    setSelectedVariants(appliedFilters.variants)
  }, [appliedFilters])

  const catalog = useInfiniteCatalog<Product>({
    filters: appliedFilters,
    sort,
    initialTotalDocs: 0,
  })

  const products = catalog.docs
  const totalDocs = catalog.totalDocs
  const loading = catalog.isInitialLoading

  const hasFilters = hasActiveCatalogFilters({
    q: appliedFilters.q,
    categories: appliedFilters.categories,
    brands: appliedFilters.brands,
    specs: appliedFilters.specs,
    variants: appliedFilters.variants,
  })

  const applySidebarFilters = () => {
    router.push(
      buildSearchPathFromSnapshot({
        q: searchQuery,
        categories: selectedCategories,
        brands: selectedBrands,
        specs: selectedSpecs,
        variants: selectedVariants,
      }),
    )
  }

  const clearSidebarFilters = () => {
    router.push('/search')
  }

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((entry) => entry !== spec) : [...prev, spec],
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <div className="hidden lg:col-span-1 lg:block">
        <div className="sticky top-28 rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Filters
              </h2>
            </div>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearSidebarFilters}
                className="text-xs font-medium text-primary hover:text-primary-hover"
              >
                Clear
              </button>
            ) : null}
          </div>

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

          <button
            type="button"
            onClick={applySidebarFilters}
            className="mt-6 w-full rounded-2xl bg-primary py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div id="catalog-results" className="scroll-mt-24 lg:col-span-3">
        <FilterActiveChips
          categories={categories}
          filterOptions={filterOptions}
          applied={appliedFilters}
        />

        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {loading ? 'Searching...' : `Found ${totalDocs} Products · ${catalogSortToLabel(sort)}`}
          </span>
          {hasFilters || sort !== 'popular' ? (
            <Link
              href="/search"
              className="text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
            >
              Reset All
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No products found matching your filters.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-block border-b border-primary pb-0.5 text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {products.map((prod: Product) => {
                const imageUrl = getImageUrl(getProductMainImage(prod), 'card')
                const brandTitle = getProductBrandTitle(prod)
                return (
                  <div
                    key={prod.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
                  >
                    <Link href={`/product/${prod.slug}`} className="flex h-full flex-col">
                      <div className="relative flex aspect-square w-full items-center justify-center bg-black p-3 sm:p-4">
                        <SafeImage
                          src={imageUrl}
                          alt={prod.title}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-grow flex-col p-3 sm:p-4">
                        {brandTitle ? (
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                            {brandTitle}
                          </span>
                        ) : null}
                        <h3 className="mb-2 line-clamp-2 flex-grow text-sm font-medium leading-snug text-white">
                          {prod.title}
                        </h3>
                      </div>
                    </Link>

                    <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                      <AddToCartButton product={prod} />
                    </div>
                  </div>
                )
              })}
            </div>

            <CatalogLoadMore isLoading={catalog.isLoadingMore} hasMore={catalog.hasMore} />
            <InfiniteScrollSentinel
              enabled={catalog.hasMore && !catalog.isInitialLoading && !catalog.isLoadingMore}
              onIntersect={catalog.onIntersect}
            />
          </div>
        )}
      </div>
    </div>
  )
}
