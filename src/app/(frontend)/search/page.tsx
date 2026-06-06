import React, { Suspense } from 'react'
import { getCategories } from '@/services/categories'
import { getAllBrands } from '@/services/products'
import { SearchCatalog } from './SearchCatalog'

export default async function SearchPage() {
  const [categories, brands] = await Promise.all([getCategories(), getAllBrands()])

  return (
    <div className="w-full min-h-screen bg-luxury-black pb-20">
      <section className="border-b border-luxury-gray/40 bg-luxury-dark/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-white uppercase">
            Search Catalog
          </h1>
          <p className="mt-2 text-xs uppercase tracking-widest text-luxury-gold">
            Browse our entire collection of luxury showcase goods
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading catalog...</div>}>
          <SearchCatalog categories={categories} brands={brands} />
        </Suspense>
      </section>
    </div>
  )
}
