import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { Search, MessageCircle, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category, Brand } from '@/payload-types'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    brand?: string
    page?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', category = '', brand = '', page = '1' } = await searchParams

  const currentPage = Number(page) || 1

  // Fetch filtered products
  const { products, totalPages, totalDocs } = await getProducts({
    search: q,
    categorySlug: category === 'ALL' || category === '' ? undefined : category,
    brand: brand === 'ALL' || brand === '' ? undefined : brand,
    page: currentPage,
    limit: 12,
  })

  const categories = await getCategories()
  const brands = await getAllBrands()

  return (
    <div className="w-full min-h-screen bg-luxury-black pb-20">
      {/* Search Header Banner */}
      <section className="border-b border-luxury-gray/40 bg-luxury-dark/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-white uppercase">
            Search Catalog
          </h1>
          <p className="mt-2 text-xs uppercase tracking-widest text-luxury-gold">
            Browse our entire collection of luxury showcase goods
          </p>
        </div>
      </section>

      {/* Main Search Layout */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 1. Sidebar Filters (Desktop) / Top Filters (Mobile) */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-luxury-gray bg-[#0c0c0c] p-6 sticky top-24">
              <div className="flex items-center gap-2 border-b border-luxury-gray/40 pb-4 mb-6">
                <SlidersHorizontal className="h-4 w-4 text-luxury-gold" />
                <h2 className="font-serif text-sm font-semibold tracking-widest text-white uppercase">FILTERS</h2>
              </div>

              <form method="GET" className="flex flex-col gap-6">
                {/* Search Text */}
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Search Text</label>
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

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Category</label>
                  <select
                    name="category"
                    defaultValue={category || 'ALL'}
                    className="w-full rounded border border-luxury-gray bg-[#040404] px-3 py-2.5 text-xs text-white focus:border-luxury-gold focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((cat: Category) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Selection */}
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

                {/* Apply Button */}
                <button
                  type="submit"
                  className="w-full rounded bg-luxury-gold py-3 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-luxury-gold-hover transition-colors shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                >
                  APPLY FILTERS
                </button>
              </form>
            </div>
          </div>

          {/* 2. Products Grid (Col-Span 3) */}
          <div className="lg:col-span-3">
            <div className="border-b border-luxury-gray/40 pb-4 mb-6 flex justify-between items-center">
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Found {totalDocs} Products
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

            {products.length === 0 ? (
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
                  {products.map((prod: Product) => {
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
                            {typeof prod.brand === 'object' && prod.brand !== null ? (prod.brand as Brand).title : String(prod.brand)}
                          </h3>
                          <h4 className="mt-1 text-sm font-medium text-white line-clamp-1 group-hover:text-luxury-gold transition-colors">
                            {prod.title}
                          </h4>
                          <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                            {prod.shortDescription}
                          </p>
                        </Link>

                        <div className="mt-4 border-t border-luxury-gray/40 pt-4">
                          <a
                            href={`https://wa.me/${
                              process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
                            }?text=${encodeURIComponent(
                              `Hello,\n\nI am interested in this product:\n\nProduct Name: ${prod.title}\nProduct URL: ${
                                process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewcartdeals.com'
                              }/product/${prod.slug}\n\nPlease share more details.`
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

                {/* Pagination */}
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
      </section>
    </div>
  )
}
