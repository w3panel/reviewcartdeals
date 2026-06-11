import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts, getAllBrands } from '@/services/products'
import { Search, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react'
import { getImageUrl, getProductMainImage } from '@/lib/utils'
import type { Product, Brand } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'

interface CategoryProductsProps {
  slug: string
  searchParams: Promise<{
    q?: string
    brand?: string
    page?: string
  }>
}

export async function CategoryProducts({ slug, searchParams }: CategoryProductsProps) {
  const { q = '', brand = '', page = '1' } = await searchParams
  const currentPage = Number(page) || 1

  const { products, totalPages } = await getProducts({
    categorySlug: slug,
    search: q,
    brand: brand === 'ALL' ? undefined : brand,
    page: currentPage,
    limit: 8,
  })

  const brands = await getAllBrands()

  return (
    <>
      <form
        method="GET"
        className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border pb-8 mb-8"
      >
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search in this category..."
            className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <select
            name="brand"
            defaultValue={brand || 'ALL'}
            className="w-full md:w-48 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
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
            className="rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            FILTER
          </button>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          <Link
            href={`/category/${slug}`}
            className="mt-4 inline-block text-xs font-semibold tracking-widest text-primary uppercase border-b border-primary pb-1 hover:text-foreground transition-colors"
          >
            Reset Filters
          </Link>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((prod: any) => {
              const imageUrl = getImageUrl(getProductMainImage(prod))
              return (
                <div
                  key={prod.id}
                  className="flex flex-col p-4 sm:p-6 border border-border rounded-2xl bg-card hover:border-primary transition-all duration-300 relative group gap-4 sm:gap-6"
                >
                  <Link
                    href={`/product/${prod.slug}`}
                    className="flex flex-col flex-grow gap-4 sm:gap-6"
                  >
                    {/* Image Frame */}
                    <div className="relative flex items-center justify-center w-full bg-background rounded-lg aspect-square overflow-hidden">
                      {/* Badges */}
                      {(() => {
                        const isNew =
                          new Date(prod.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
                        return (
                          <>
                            {isNew && (
                              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-primary text-primary-foreground px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-widest z-10">
                                NEW
                              </span>
                            )}
                            {prod.limitedEdition && (
                              <span className="absolute top-3 right-3 sm:top-4 sm:right-4 border border-primary/40 text-primary px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-widest z-10">
                                LIMITED EDITION
                              </span>
                            )}
                          </>
                        )
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
                        <div className="flex items-center gap-1 text-[12px] font-bold text-primary uppercase tracking-[0.15em]">
                          {typeof prod.brand === 'object' && prod.brand !== null
                            ? (prod.brand as Brand).title
                            : String(prod.brand)}
                          {typeof prod.brand === 'object' &&
                            prod.brand !== null &&
                            (prod.brand as Brand).verified && (
                              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                            )}
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                        {prod.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-3">
                        {prod.description}
                      </p>

                      {/* Specifications Row */}
                      {prod.specifications && prod.specifications.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 text-[10px] sm:text-[11px] text-gray-400 font-medium">
                          {prod.specifications
                            .slice(0, 3)
                            .map(
                              (
                                spec: { key: string; value: string; id?: string | null },
                                idx: number,
                              ) => (
                                <div key={spec.id ?? idx} className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-primary" />
                                  {spec.value}
                                </div>
                              ),
                            )}
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
                  href={`/category/${slug}?q=${q}&brand=${brand}&page=${currentPage - 1}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 text-muted-foreground cursor-not-allowed">
                  <ChevronLeft className="h-5 w-5" />
                </div>
              )}

              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                PAGE {currentPage} OF {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/category/${slug}?q=${q}&brand=${brand}&page=${currentPage + 1}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 text-muted-foreground cursor-not-allowed">
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
