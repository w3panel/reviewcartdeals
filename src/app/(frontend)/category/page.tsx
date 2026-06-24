import React from 'react'
import { getCategoriesPage } from '@/services/categories'
import { CategoryCatalog } from './CategoryCatalog'

export const revalidate = 120

export const metadata = {
  title: 'Categories',
  description: 'Browse our collections by category.',
}

export default async function CategoriesPage() {
  const { docs: categories, totalDocs } = await getCategoriesPage()

  return (
    <div className="min-h-screen w-full bg-background pb-24 md:pb-12">
      <section className="border-b border-border bg-card px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-serif text-3xl text-white sm:text-4xl md:text-5xl">Categories</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary sm:text-sm">
            Browse our collections
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <CategoryCatalog initialCategories={categories} initialTotalDocs={totalDocs} />
      </section>
    </div>
  )
}
