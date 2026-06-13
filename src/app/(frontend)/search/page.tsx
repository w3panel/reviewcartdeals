import React, { Suspense } from 'react'
import { getCategories } from '@/services/categories'
import { getAllBrands } from '@/services/products'
import { SearchCatalog } from './SearchCatalog'

export default async function SearchPage() {
  const [categories, brands] = await Promise.all([getCategories(), getAllBrands()])

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
          <SearchCatalog categories={categories} brands={brands} />
        </Suspense>
      </section>
    </div>
  )
}
