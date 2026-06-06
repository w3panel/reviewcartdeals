'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  SlidersHorizontal, ArrowUpDown, Tag as TagIcon, Star, 
  ChevronUp, ChevronDown, LayoutGrid, BadgeCheck 
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category, Brand, Media } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'

interface FrontPageCatalogProps {
  categories: Category[]
  brands: string[]
  initialProducts: Product[]
  initialTotalDocs: number
}

export function FrontPageCatalog({ categories, brands, initialProducts, initialTotalDocs }: FrontPageCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [totalDocs, setTotalDocs] = useState<number>(initialTotalDocs)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    // If no filters are applied, and we just mounted, we can rely on initial data to save a request.
    // However, if filters change, we fetch.
    const fetchFilteredProducts = async () => {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','))
      
      try {
        const res = await fetch(`/api/products/catalog?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
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
    setSelectedBrands(prev => 
      prev.includes(brandTitle)
        ? prev.filter(b => b !== brandTitle)
        : [...prev, brandTitle]
    )
  }

  const handleClearAll = () => {
    setSelectedCategory(null)
    setSelectedBrands([])
  }

  return (
    <>
      {/* Filter / Sort Horizontal Bar */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          <button className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-foreground bg-transparent border border-border rounded-full flex-shrink-0 hover:border-[#F5B82A] transition-all relative">
            <SlidersHorizontal className="w-4 h-4 text-[#F5B82A]" /> Filters
            {(selectedCategory || selectedBrands.length > 0) && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#F5B82A]"></span>
            )}
          </button>
          <button className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-foreground bg-transparent border border-border rounded-full hover:border-[#F5B82A] transition-colors flex-shrink-0">
            <ArrowUpDown className="w-4 h-4 text-[#F5B82A]" /> Sort
          </button>
          <button className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-foreground bg-transparent border border-border rounded-full hover:border-[#F5B82A] transition-colors flex-shrink-0">
            <TagIcon className="w-4 h-4 text-[#F5B82A]" /> Brand
          </button>

          {(selectedCategory || selectedBrands.length > 0) && (
            <div className="ml-auto pl-4">
              <button 
                onClick={handleClearAll}
                className="text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors flex-shrink-0"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Split: Sidebar + Product Grid */}
      <div className="px-4 mt-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar (Desktop/Tablet/Mobile) */}
        <div className="w-full md:w-64 lg:w-72 flex-shrink-0 space-y-6">
          {/* Categories Accordion */}
          <div className="bg-transparent border border-border p-4 rounded-2xl">
            <h3 className="text-[15px] font-medium text-primary flex justify-between items-center mb-4 cursor-pointer">
              Categories
              <ChevronUp className="w-4 h-4 text-primary" />
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[13px] transition-all ${selectedCategory === null ? 'bg-transparent border border-primary text-primary shadow-sm' : 'text-gray-300 hover:text-primary hover:bg-muted border border-transparent'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                All Categories
              </button>
              {categories.slice(0, 6).map((cat: Category) => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat.slug || null)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] font-medium group ${selectedCategory === cat.slug ? 'bg-transparent border border-primary text-primary shadow-sm' : 'text-gray-300 hover:text-primary hover:bg-muted border border-transparent'}`}
                >
                  <div className="w-4 h-4 relative flex items-center justify-center flex-shrink-0">
                    <Image src={getImageUrl((cat as any).icon || cat.image)} alt="" fill className={`object-contain transition-all dark:brightness-0 dark:invert ${selectedCategory === cat.slug ? 'grayscale-0 opacity-100' : 'opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`} />
                  </div>
                  <span className="text-left truncate">{cat.title}</span>
                </button>
              ))}
              {categories.length > 6 && (
                <button className="flex items-center justify-between w-full text-primary text-[13px] font-medium mt-2 pt-2 px-3 transition-colors">
                  Show More <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-transparent border border-border p-4 rounded-2xl">
            <h3 className="text-[15px] font-medium text-primary flex justify-between items-center mb-4 cursor-pointer">
              Brands
              <ChevronUp className="w-4 h-4 text-primary" />
            </h3>
            <div className="space-y-4 px-3">
              {brands.slice(0, 6).map(brand => {
                const isSelected = selectedBrands.includes(brand)
                return (
                  <button 
                    onClick={() => toggleBrand(brand)}
                    key={brand} 
                    className="flex w-full items-center gap-3 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 border rounded-[3px] flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-transparent' : 'border-gray-600 bg-transparent group-hover:border-primary'}`}>
                      <div className={`w-2.5 h-2.5 bg-primary rounded-[1px] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                    </div>
                    <span className={`font-medium text-[13px] transition-colors ${isSelected ? 'text-foreground' : 'text-gray-300 group-hover:text-foreground'}`}>{brand}</span>
                  </button>
                )
              })}
              {brands.length > 6 && (
                <button className="flex items-center justify-between w-full text-primary text-[13px] font-medium mt-2 pt-2 transition-colors">
                  View More <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1">
          {/* Product List Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-primary">
              {isLoading ? 'Loading...' : `${totalDocs.toLocaleString()} Products found`}
            </span>
            <div className="flex items-center gap-1 cursor-pointer group">
              <span className="text-[13px] text-gray-400">Sort by:</span>
              <span className="text-[13px] font-medium text-primary">Popular</span>
              <ChevronDown className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 && !isLoading ? (
            <div className="py-20 text-center rounded border border-border bg-card">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              <button
                onClick={handleClearAll}
                className="mt-4 inline-block text-xs font-semibold tracking-widest text-[#F5B82A] uppercase border-b border-[#F5B82A] pb-0.5 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {products.map((prod: any) => (
                <div
                  key={prod.id}
                  className="flex flex-col p-4 sm:p-6 border border-border rounded-2xl bg-card hover:border-[#F5B82A] hover:-translate-y-1 transition-all duration-300 relative group gap-4 sm:gap-6"
                >
                  <Link href={`/product/${prod.slug}`} className="flex flex-col flex-grow gap-4 sm:gap-6">
                    {/* Image Frame */}
                    <div className="relative flex items-center justify-center w-full bg-[#0e0e0e] rounded-lg aspect-square overflow-hidden">
                      {/* Badges */}
                      {(() => {
                        const isNew = new Date(prod.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
                        return (
                          <>
                            {isNew && (
                              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#F5B82A] text-black px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-widest z-10">
                                NEW
                              </span>
                            )}
                            {prod.limitedEdition && (
                              <span className="absolute top-3 right-3 sm:top-4 sm:right-4 border border-[#F5B82A]/40 text-[#F5B82A] px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-widest z-10">
                                LIMITED EDITION
                              </span>
                            )}
                          </>
                        );
                      })()}
                      {(() => {
                        const typedProd = prod as Product;
                        const imageUrl = getImageUrl(typedProd.image as Media | number);
                        return (
                          <Image
                            src={imageUrl}
                            alt={prod.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        );
                      })()}
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-[12px] font-bold text-[#F5B82A] uppercase tracking-[0.15em]">
                          {typeof prod.brand === 'object' && prod.brand !== null ? (prod.brand as Brand).title : String(prod.brand)}
                          {typeof prod.brand === 'object' && prod.brand !== null && (prod.brand as Brand).verified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-[#F5B82A]" />
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
                        {prod.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 line-clamp-3">
                        {prod.shortDescription}
                      </p>

                      {/* Specifications Row */}
                      {prod.specifications && prod.specifications.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 text-[10px] sm:text-[11px] text-gray-400 font-medium">
                          {prod.specifications.slice(0, 3).map((spec: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-[#F5B82A]" />
                              {spec.value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="mt-auto pt-2 flex gap-3">
                    <AddToCartButton product={prod as Product} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
