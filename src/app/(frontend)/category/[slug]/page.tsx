import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { Search, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Brand } from '@/payload-types'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    q?: string
    brand?: string
    page?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { q = '', brand = '', page = '1' } = await searchParams

  const category = await getCategoryBySlug(slug)
  if (!category) {
    notFound()
  }

  const currentPage = Number(page) || 1
  const { products, totalPages } = await getProducts({
    categorySlug: slug,
    search: q,
    brand: brand === 'ALL' ? undefined : brand,
    page: currentPage,
    limit: 8,
  })

  const brands = await getAllBrands()

  const bannerImageUrl = getImageUrl(category.image)

  return (
    <div className="w-full min-h-screen bg-luxury-black pb-20">
      {/* Category Header Banner */}
      <section className="relative h-[40vh] w-full overflow-hidden border-b border-luxury-gray">
        <Image
          src={bannerImageUrl}
          alt={category.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 mx-auto max-w-7xl">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold tracking-widest text-luxury-gold uppercase hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" /> BACK TO CATALOG
          </Link>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-wider uppercase">
            {category.title}
          </h1>
          <p className="mt-2 text-sm text-gray-300 max-w-2xl leading-relaxed font-light">
            {category.description}
          </p>
        </div>
      </section>

      {/* Main Filter & Grid Container */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search & Filter Bar */}
        <form method="GET" className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-luxury-gray/40 pb-8 mb-8">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search in this category..."
              className="w-full rounded border border-luxury-gray bg-[#0d0d0d] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-500" />
          </div>

          <div className="flex w-full md:w-auto gap-4">
            <select
              name="brand"
              defaultValue={brand || 'ALL'}
              className="w-full md:w-48 rounded border border-luxury-gray bg-[#0d0d0d] px-4 py-3 text-sm text-white focus:border-luxury-gold focus:outline-none"
            >
              <option value="ALL">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded bg-luxury-gold px-6 py-3 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-luxury-gold-hover transition-colors"
            >
              FILTER
            </button>
          </div>
        </form>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <Link
              href={`/category/${slug}`}
              className="mt-4 inline-block text-xs font-semibold tracking-widest text-luxury-gold uppercase border-b border-luxury-gold pb-1 hover:text-white transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-4">
                {currentPage > 1 ? (
                  <Link
                    href={`/category/${slug}?q=${q}&brand=${brand}&page=${currentPage - 1}`}
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
                    href={`/category/${slug}?q=${q}&brand=${brand}&page=${currentPage + 1}`}
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
      </section>
    </div>
  )
}
