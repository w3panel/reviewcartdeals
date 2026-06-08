'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SlidersHorizontal, LayoutGrid, Heart, Star, ChevronDown } from 'lucide-react'
import { getImageUrl, getProductMainImage } from '@/lib/utils'
import type { Product, Category, Brand } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'
import { FilterSheet } from '@/components/FilterSheet'
import { SortSheet } from '@/components/SortSheet'

interface FrontPageCatalogProps {
  categories: Category[]
  brands: string[]
  initialProducts: Product[]
  initialTotalDocs: number
}

interface CatalogResponse {
  docs: Product[]
  totalDocs: number
}

export function FrontPageCatalog({ categories, brands, initialProducts, initialTotalDocs }: FrontPageCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [totalDocs, setTotalDocs] = useState<number>(initialTotalDocs)
  const [isLoading, setIsLoading] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  useEffect(() => {
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

  const activeFilterCount = (selectedCategory ? 1 : 0) + selectedBrands.length

  return (
    <>
      <div className="px-4 mt-6 sm:mt-8 pb-32 md:pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Categories</h2>
          <Link href="/search" className="text-sm text-muted-foreground hover:text-primary">
            See all
          </Link>
        </div>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-6">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="flex flex-col items-center flex-shrink-0 gap-2"
          >
            <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-colors ${
              selectedCategory === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}>
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs font-medium text-foreground">All</span>
          </button>

          {categories.slice(0, 8).map((cat: Category) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug!)}
              className="flex flex-col items-center flex-shrink-0 gap-2"
            >
              <div className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden transition-colors ${
                selectedCategory === cat.slug ? 'ring-2 ring-primary' : ''
              } bg-muted`}>
                {cat.image ? (
                  <Image src={getImageUrl(cat.image)} alt={cat.title} fill className="object-cover" />
                ) : (
                  <span className="text-lg font-bold text-foreground">{cat.title.charAt(0)}</span>
                )}
              </div>
              <span className="text-xs font-medium text-foreground max-w-[64px] truncate">{cat.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-6">
          <button type="button" onClick={() => setIsFilterOpen(true)} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-foreground">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Filters</span>
          </button>

          <button type="button" onClick={() => setIsSortOpen(true)} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort</span>
          </button>

          {(selectedCategory || selectedBrands.length > 0) && (
            <button type="button" onClick={handleClearAll} className="flex-shrink-0 ml-1">
              <span className="text-[11px] font-bold text-primary border-b border-primary pb-0.5">Clear All</span>
            </button>
          )}
        </div>

        {(selectedCategory || selectedBrands.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground">
                {categories.find((c) => c.slug === selectedCategory)?.title}
                <button type="button" onClick={() => setSelectedCategory(null)} className="ml-2 text-muted-foreground">✕</button>
              </span>
            )}
            {selectedBrands.map((brand) => (
              <span key={brand} className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground">
                {brand}
                <button type="button" onClick={() => toggleBrand(brand)} className="ml-2 text-muted-foreground">✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-6 border-t border-border pt-6">
          <span className="text-sm font-medium text-foreground">
            {isLoading ? 'Loading...' : <><span className="text-lg font-bold">{totalDocs.toLocaleString()}</span> products</>}
          </span>
          <button type="button" onClick={() => setIsSortOpen(true)} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            Sort by: Popular <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {products.length === 0 && !isLoading ? (
          <div className="py-16 text-center rounded-2xl bg-card border border-border">
            <p className="text-muted-foreground">No products found matching your filters.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {products.map((prod) => (
              <div key={prod.id} className="flex flex-col bg-card rounded-2xl overflow-hidden border border-border group">
                <Link href={`/product/${prod.slug}`} className="flex flex-col h-full">
                  <div className="relative w-full aspect-square bg-background flex items-center justify-center p-3 sm:p-4">
                    <button type="button" className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center" aria-label="Save product">
                      <Heart className="w-4 h-4 text-foreground" />
                    </button>
                    <div className="relative w-full h-full">
                      <Image
                        src={getImageUrl(getProductMainImage(prod))}
                        alt={prod.title}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      {typeof prod.brand === 'object' && prod.brand !== null ? (prod.brand as Brand).title : String(prod.brand)}
                    </span>
                    <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 mb-2 flex-grow">
                      {prod.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {(prod as Product & { stats?: { averageRating?: number } }).stats?.averageRating?.toFixed(1) ?? '—'}
                      </span>
                    </div>
                    <AddToCartButton product={prod} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full shadow-lg font-medium text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
        </button>
      </div>

      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBrands={selectedBrands}
        toggleBrand={toggleBrand}
        handleClearAll={handleClearAll}
        totalDocs={totalDocs}
      />

      <SortSheet isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} />
    </>
  )
}
