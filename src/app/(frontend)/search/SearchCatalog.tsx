'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { SafeImage } from '@/components/SafeImage'
import { CatalogFilterFields } from '@/components/CatalogFilterFields'
import { FilterActiveChips } from '@/components/FilterActiveChips'
import type { CatalogFilterOptions } from '@/lib/catalogFilterTypes'
import {
  appendCatalogFiltersToParams,
  buildSearchPath,
  buildSearchPathFromSnapshot,
  hasActiveCatalogFilters,
  snapshotFromSearchParams,
} from '@/lib/catalogFilterParams'
import { catalogSortToLabel, parseCatalogSort } from '@/lib/catalogUrl'
import { getImageUrl, getProductBrandTitle, getProductMainImage } from '@/lib/utils'
import type { Product, Category } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'

interface SearchCatalogProps {
  categories: Category[]
  brands: string[]
  filterOptions: CatalogFilterOptions
}

interface CatalogResponse {
  docs: Product[]
  totalDocs: number
  totalPages: number
  page: number
}

export function SearchCatalog({ categories, brands, filterOptions }: SearchCatalogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const appliedFilters = useMemo(() => snapshotFromSearchParams(searchParams), [searchParams])
  const sort = parseCatalogSort(searchParams.get('sort'))

  const [searchQuery, setSearchQuery] = useState(appliedFilters.q)
  const [selectedCategories, setSelectedCategories] = useState(appliedFilters.categories)
  const [selectedBrands, setSelectedBrands] = useState(appliedFilters.brands)
  const [selectedSpecs, setSelectedSpecs] = useState(appliedFilters.specs)
  const [selectedVariants, setSelectedVariants] = useState(appliedFilters.variants)

  const [data, setData] = useState<CatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSearchQuery(appliedFilters.q)
    setSelectedCategories(appliedFilters.categories)
    setSelectedBrands(appliedFilters.brands)
    setSelectedSpecs(appliedFilters.specs)
    setSelectedVariants(appliedFilters.variants)
  }, [appliedFilters])

  useEffect(() => {
    const params = appendCatalogFiltersToParams(new URLSearchParams(), {
      q: appliedFilters.q,
      categories: appliedFilters.categories,
      brands: appliedFilters.brands,
      specs: appliedFilters.specs,
      variants: appliedFilters.variants,
      sort,
      page: searchParams.get('page') || '1',
    })

    setLoading(true)
    fetch(`/api/products/catalog?${params.toString()}`)
      .then((res) => res.json() as Promise<CatalogResponse>)
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [appliedFilters, searchParams, sort])

  const products = data?.docs ?? []
  const totalDocs = data?.totalDocs ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = Number(searchParams.get('page') || '1') || 1

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

  const buildPageHref = (page: number) => {
    const params = appendCatalogFiltersToParams(new URLSearchParams(), {
      q: appliedFilters.q,
      categories: appliedFilters.categories,
      brands: appliedFilters.brands,
      specs: appliedFilters.specs,
      variants: appliedFilters.variants,
      sort,
      page,
    })
    return buildSearchPath(params)
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

            {totalPages > 1 ? (
              <div className="mt-16 flex items-center justify-center gap-4">
                {currentPage > 1 ? (
                  <Link
                    href={buildPageHref(currentPage - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                ) : (
                  <div className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-border/50 text-muted-foreground">
                    <ChevronLeft className="h-5 w-5" />
                  </div>
                )}

                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  PAGE {currentPage} OF {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={buildPageHref(currentPage + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <div className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-border/50 text-muted-foreground">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
