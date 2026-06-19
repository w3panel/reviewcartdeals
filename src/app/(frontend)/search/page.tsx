import React from 'react'
import { getCategories } from '@/services/categories'
import { getAllBrands, getProducts } from '@/services/products'
import { parseCatalogSort } from '@/lib/catalogUrl'
import { SearchCatalog } from './SearchCatalog'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    brand?: string
    sort?: string
    page?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const category = params.category ?? ''
  const brand = params.brand ?? ''
  const sort = parseCatalogSort(params.sort)
  const page = Number(params.page) || 1

  const [categories, brands, catalogResult] = await Promise.all([
    getCategories(),
    getAllBrands(),
    getProducts({
      search: q || undefined,
      categorySlug: category && category !== 'ALL' ? category : undefined,
      brand: brand && brand !== 'ALL' ? brand : undefined,
      sort,
      page,
      limit: 12,
    }),
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
        <SearchCatalog
          categories={categories}
          brands={brands}
          catalog={{
            products: catalogResult.products,
            totalDocs: catalogResult.totalDocs,
            totalPages: catalogResult.totalPages,
            page: catalogResult.page ?? page,
          }}
          params={{ q, category, brand, sort, page }}
        />
      </section>
    </div>
  )
}
