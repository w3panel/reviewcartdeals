'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Search, MessageCircle, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category, Brand } from '@/payload-types'

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
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {products.map((prod) => {
                const imageUrl = getImageUrl(prod.image)
                return (
                  <div
                    key={prod.id}
                    className="group relative flex flex-col rounded border border-luxury-gray bg-[#0c0c0c] p-4 hover-gold-glow transition-all duration-300"
                  >
                    <Link href={`/product/${prod.slug}`} className="flex-grow flex flex-col">
                      <div className="relative aspect-square w-full overflow-hidden rounded bg-black flex items-center justify-center">
                        <Image
                          src={imageUrl}
                          alt={prod.title}
                          width={200}
                          height={200}
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="mt-4 font-serif text-xs font-semibold tracking-widest text-luxury-gold uppercase">
                        {typeof prod.brand === 'object' && prod.brand !== null
                          ? (prod.brand as Brand).title
                          : String(prod.brand)}
                      </h3>
                      <h4 className="mt-1 text-sm font-medium text-white line-clamp-1 group-hover:text-luxury-gold transition-colors">
                        {prod.title}
                      </h4>
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{prod.shortDescription}</p>
                    </Link>

                    <div className="mt-4 border-t border-luxury-gray/40 pt-4">
                      <a
                        href={`https://wa.me/${
                          process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
                        }?text=${encodeURIComponent(
                          `Hello,\n\nI am interested in this product:\n\nProduct Name: ${prod.title}\nProduct URL: ${
                            process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewcartdeals.com'
                          }/product/${prod.slug}\n\nPlease share more details.`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-1.5 rounded bg-luxury-gold/10 hover:bg-luxury-gold border border-luxury-gold/30 hover:border-luxury-gold py-2 text-[10px] font-bold tracking-widest text-luxury-gold hover:text-luxury-black transition-all duration-300"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        ENQUIRE NOW
                      </a>
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
