'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Search, MessageCircle, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category, Brand, Media } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'
import { BadgeCheck } from 'lucide-react'

interface SearchCatalogProps {
  categories: Category[]
  brands: string[]
}

interface CatalogResponse {
  docs: Product[]
  totalDocs: number
  totalPages: number
  page: number
}

export function SearchCatalog({ categories, brands }: SearchCatalogProps) {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const brand = searchParams.get('brand') || ''
  const page = searchParams.get('page') || '1'

  const [data, setData] = useState<CatalogResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (brand) params.set('brand', brand)
    if (page) params.set('page', page)

    setLoading(true)
    fetch(`/api/products/catalog?${params.toString()}`)
      .then((res) => res.json() as Promise<CatalogResponse>)
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [q, category, brand, page])

  const products = data?.docs ?? []
  const totalDocs = data?.totalDocs ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = Number(page) || 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-luxury-gray bg-[#0c0c0c] p-6 sticky top-24">
          <div className="flex items-center gap-2 border-b border-luxury-gray/40 pb-4 mb-6">
            <SlidersHorizontal className="h-4 w-4 text-luxury-gold" />
            <h2 className="font-serif text-sm font-semibold tracking-widest text-white uppercase">FILTERS</h2>
          </div>

          <form method="GET" className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">
                Search Text
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Keyword..."
                  className="w-full rounded border border-luxury-gray bg-[#040404] py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-600 focus:border-luxury-gold focus:outline-none"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">
                Category
              </label>
              <select
                name="category"
                defaultValue={category || 'ALL'}
                className="w-full rounded border border-luxury-gray bg-[#040404] px-3 py-2.5 text-xs text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Brand</label>
              <select
                name="brand"
                defaultValue={brand || 'ALL'}
                className="w-full rounded border border-luxury-gray bg-[#040404] px-3 py-2.5 text-xs text-white focus:border-luxury-gold focus:outline-none"
              >
                <option value="ALL">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded bg-luxury-gold py-3 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-luxury-gold-hover transition-colors shadow-[0_0_15px_rgba(197,168,128,0.1)]"
            >
              APPLY FILTERS
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="border-b border-luxury-gray/40 pb-4 mb-6 flex justify-between items-center">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            {loading ? 'Searching...' : `Found ${totalDocs} Products`}
          </span>
          {(q || category || brand) && (
            <Link
              href="/search"
              className="text-xs font-semibold tracking-widest text-luxury-gold hover:text-white transition-colors uppercase"
            >
              Reset All
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center rounded border border-luxury-gray bg-[#0c0c0c]">
            <p className="text-gray-500 text-lg">No products found matching your filters.</p>
            <Link
              href="/search"
              className="mt-4 inline-block text-xs font-semibold tracking-widest text-luxury-gold uppercase border-b border-luxury-gold pb-0.5 hover:text-white transition-colors"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((prod: any) => {
                const imageUrl = getImageUrl(prod.image as Media | number)
                return (
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
                        <Image
                          src={imageUrl}
                          alt={prod.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
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
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-4">
                {currentPage > 1 ? (
                  <Link
                    href={`/search?q=${q}&category=${category}&brand=${brand}&page=${currentPage - 1}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-luxury-gray text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-luxury-gray/20 text-gray-600 cursor-not-allowed">
                    <ChevronLeft className="h-5 w-5" />
                  </div>
                )}

                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  PAGE {currentPage} OF {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`/search?q=${q}&category=${category}&brand=${brand}&page=${currentPage + 1}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-luxury-gray text-gray-400 hover:border-luxury-gold hover:text-luxury-gold transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-luxury-gray/20 text-gray-600 cursor-not-allowed">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
