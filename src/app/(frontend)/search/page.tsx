import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { getCategories } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { getCatalogFilterOptions } from '@/services/catalogFilters'
import { SearchCatalog } from './SearchCatalog'

const SearchFilterHost = dynamic(() =>
  import('@/components/SearchFilterHost').then((mod) => ({ default: mod.SearchFilterHost })),
)

export default async function SearchPage() {
  const [categories, brands, filterOptions, { totalDocs }] = await Promise.all([
    getCategories(),
    getAllBrands(),
    getCatalogFilterOptions(),
    getProducts({ limit: 1 }),
  ])

  return (
    <div className="min-h-screen w-full bg-background pb-24 md:pb-12">
      <section className="border-b border-border bg-card px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-serif text-3xl text-white sm:text-4xl md:text-5xl">Browse Catalog</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary sm:text-sm">
            Search our full collection
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Suspense
          fallback={
            <div className="py-20 text-center text-muted-foreground">Loading catalog...</div>
          }
        >
          <SearchCatalog categories={categories} brands={brands} filterOptions={filterOptions} />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <SearchFilterHost
          categories={categories}
          brands={brands}
          filterOptions={filterOptions}
          initialTotalDocs={totalDocs}
        />
      </Suspense>
    </div>
  )
}
