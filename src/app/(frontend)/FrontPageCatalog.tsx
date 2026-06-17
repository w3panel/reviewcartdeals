'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import type { Category } from '@/payload-types'
import { ProductReviewCard, type ProductWithStats } from '@/components/ProductReviewCard'

const FilterSheet = dynamic(() =>
  import('@/components/FilterSheet').then((mod) => ({ default: mod.FilterSheet })),
)
const SortSheet = dynamic(() =>
  import('@/components/SortSheet').then((mod) => ({ default: mod.SortSheet })),
)

interface FrontPageCatalogProps {
  categories: Category[]
  brands: string[]
  initialProducts: ProductWithStats[]
  initialTotalDocs: number
}

interface CatalogResponse {
  docs: ProductWithStats[]
  totalDocs: number
}

export function FrontPageCatalog({
  categories,
  brands,
  initialProducts,
  initialTotalDocs,
}: FrontPageCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [products, setProducts] = useState<ProductWithStats[]>(initialProducts)
  const [totalDocs, setTotalDocs] = useState<number>(initialTotalDocs)
  const [isLoading, setIsLoading] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  useEffect(() => {
    if (!selectedCategory && selectedBrands.length === 0) {
      return
    }

    const fetchFilteredProducts = async () => {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','))

      try {
        const res = await fetch(`/api/products/catalog?${params.toString()}`)
        if (res.ok) {
          const data = (await res.json()) as CatalogResponse
          setProducts(data.docs || [])
          setTotalDocs(data.totalDocs || 0)
        }
      } catch (err) {
        console.error('Failed to fetch filtered products', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFilteredProducts()
  }, [selectedCategory, selectedBrands])

  const toggleBrand = (brandTitle: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandTitle) ? prev.filter((b) => b !== brandTitle) : [...prev, brandTitle],
    )
  }

  const handleClearAll = () => {
    setSelectedCategory(null)
    setSelectedBrands([])
  }

  return (
    <>
      <section className="px-4 pb-20 pt-2 md:pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between border-t border-border pt-6">
            <h2 className="font-serif text-xl text-white sm:text-2xl">All Products</h2>
            <button
              type="button"
              onClick={() => setIsSortOpen(true)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
            >
              Sort by: Popular <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${totalDocs.toLocaleString()} products`}
          </p>

          {products.length === 0 && !isLoading ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <p className="text-muted-foreground">No products found matching your filters.</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                isLoading ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {products.map((product) => (
                <ProductReviewCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <FilterSheet
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        toggleBrand={toggleBrand}
        handleClearAll={handleClearAll}
        totalDocs={totalDocs}
      />

      {isSortOpen && <SortSheet isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} />}
    </>
  )
}
