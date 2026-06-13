import React from 'react'
import dynamic from 'next/dynamic'
import { getCategories } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { emptyProductReviewStats, getProductReviewStatsBatch } from '@/services/reviews'
import { HomeHero } from '@/components/HomeHero'
import { CategoryScroller } from '@/components/CategoryScroller'
import { ValuePropositions } from '@/components/ValuePropositions'

const FrontPageCatalog = dynamic(
  () => import('./FrontPageCatalog').then((mod) => ({ default: mod.FrontPageCatalog })),
  {
    loading: () => (
      <div className="px-4 py-12 text-center text-sm text-muted-foreground">Loading catalog...</div>
    ),
  },
)

export const revalidate = 60

export default async function HomePage() {
  const [categories, { products: allProducts, totalDocs }, brands] = await Promise.all([
    getCategories(),
    getProducts({ limit: 12 }),
    getAllBrands(),
  ])

  const statsByProduct = await getProductReviewStatsBatch(allProducts.map((prod) => prod.id))
  const productsWithStats = allProducts.map((prod) => ({
    ...prod,
    stats: statsByProduct.get(prod.id) ?? emptyProductReviewStats(),
  }))

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
        <h2 className="font-serif text-2xl text-primary sm:text-3xl">No products yet</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Add categories and products in the admin panel.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <HomeHero />
      <CategoryScroller categories={categories} />
      <FrontPageCatalog
        categories={categories}
        brands={brands}
        initialProducts={productsWithStats}
        initialTotalDocs={totalDocs}
      />
      <ValuePropositions />
    </div>
  )
}
