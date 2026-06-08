import React, { Suspense } from 'react'
import { getCategories } from '@/services/categories'
import { getAllBrands } from '@/services/products'
import { SearchCatalog } from './SearchCatalog'

export default async function SearchPage() {
  const [categories, brands] = await Promise.all([getCategories(), getAllBrands()])

  return (
    <div className="w-full min-h-screen bg-background pb-20 md:pb-12">
      <section className="border-b border-border bg-card py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-foreground">
            Browse Catalog
          </h1>
          <p className="mt-2 text-xs sm:text-sm uppercase tracking-widest text-primary">
            Search our full collection
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-20 text-center text-muted-foreground">Loading catalog...</div>
          }
        >
          <SearchCatalog categories={categories} brands={brands} />
        </Suspense>
      </section>
    </div>
  )
}
