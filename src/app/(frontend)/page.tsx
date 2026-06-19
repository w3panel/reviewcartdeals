import React from 'react'
import dynamic from 'next/dynamic'
import { getCategories } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { getCatalogFilterOptions } from '@/services/catalogFilters'
import { emptyProductReviewStats, getProductReviewStatsBatch } from '@/services/reviews'
import { HomeHero } from '@/components/HomeHero'
import { CategoryScroller } from '@/components/CategoryScroller'
import { FeaturedReviews } from '@/components/FeaturedReviews'
import { ValuePropositions } from '@/components/ValuePropositions'

const FrontPageCatalog = dynamic(
  () => import('./FrontPageCatalog').then((mod) => ({ default: mod.FrontPageCatalog })),
  {
    loading: () => (
      <div className="hidden px-4 py-12 text-center text-sm text-muted-foreground md:block">
        Loading catalog...
      </div>
    ),
  },
)

const CatalogFilterHost = dynamic(() =>
  import('@/components/CatalogFilterHost').then((mod) => ({ default: mod.CatalogFilterHost })),
)

export const revalidate = 120

export default async function HomePage() {
  const [categories, { products: allProducts, totalDocs }, brands, filterOptions] =
    await Promise.all([
      getCategories(),
      getProducts({ limit: 12 }),
      getAllBrands(),
      getCatalogFilterOptions(),
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
      <FeaturedReviews products={productsWithStats} />
      <div className="hidden md:block">
<<<<<<< HEAD
        <FrontPageCatalog initialProducts={productsWithStats} initialTotalDocs={totalDocs} />
      </div>
      <ValuePropositions />
      <CatalogFilterHost categories={categories} brands={brands} initialTotalDocs={totalDocs} />
=======
        <FrontPageCatalog
          categories={categories}
          brands={brands}
          filterOptions={filterOptions}
          initialProducts={productsWithStats}
          initialTotalDocs={totalDocs}
        />
      </div>
      <ValuePropositions />
      <HomeFilterHost
        categories={categories}
        brands={brands}
        filterOptions={filterOptions}
        initialTotalDocs={totalDocs}
      />
>>>>>>> 8ddc32c (enhanced filteres option)
    </div>
  )
}
