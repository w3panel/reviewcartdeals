import React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Search, ScanLine } from 'lucide-react'
import { getCategories } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { emptyProductReviewStats, getProductReviewStatsBatch } from '@/services/reviews'

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
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center bg-background">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">No products yet</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Add categories and products in the admin panel.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full bg-background pb-8 text-foreground min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 pt-4 md:pt-6 max-w-4xl mx-auto">
          <Link
            href="/search"
            className="relative flex items-center w-full px-4 sm:px-5 py-3 border rounded-full bg-card border-primary shadow-sm"
          >
            <Search className="w-5 h-5 text-primary mr-3" strokeWidth={2.5} />
            <span className="text-[13px] text-muted-foreground font-medium">
              Search products, brands & categories...
            </span>
            <ScanLine className="w-5 h-5 text-primary ml-auto" />
          </Link>
        </div>

        <div className="px-4 mt-4 sm:mt-6">
          <div className="relative w-full h-[180px] sm:h-[220px] md:h-[280px] rounded-2xl sm:rounded-3xl overflow-hidden bg-card flex flex-col justify-center p-6 sm:p-8">
            <div className="relative z-10 max-w-[65%] sm:max-w-[55%]">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
                Best Deals
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                Curated luxury, direct on WhatsApp
              </p>
              <Link
                href="/search"
                className="inline-block px-5 sm:px-6 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:bg-primary-hover transition-colors"
              >
                Shop Now
              </Link>
            </div>
            <div
              className="absolute top-0 right-0 w-[55%] sm:w-[50%] h-full bg-[url('/seed/hero_luxury_mobile.webp')] bg-cover bg-center opacity-70"
              style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0 100%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          </div>
        </div>

        <FrontPageCatalog
          categories={categories}
          brands={brands}
          initialProducts={productsWithStats}
          initialTotalDocs={totalDocs}
        />
      </div>
    </div>
  )
}
