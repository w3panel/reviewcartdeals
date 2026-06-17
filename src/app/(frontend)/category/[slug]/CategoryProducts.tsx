import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts, getAllBrands } from '@/services/products'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
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
          <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
          <Link
            href={`/category/${slug}`}
            className="mt-4 inline-block text-xs font-semibold tracking-widest text-primary uppercase border-b border-primary pb-1 hover:text-foreground transition-colors"
          >
            Reset Filters
          </Link>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3">
            {products.map((prod: Product) => {
              const imageUrl = getImageUrl(getProductMainImage(prod), 'card')
              return (
                <div
                  key={prod.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
                >
                  <Link href={`/product/${prod.slug}`} className="flex h-full flex-col">
                    <div className="relative flex aspect-square w-full items-center justify-center bg-black p-3 sm:p-4">
                      <Image
                        src={imageUrl}
                        alt={prod.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-grow flex-col p-3 sm:p-4">
                      <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                        {typeof prod.brand === 'object' && prod.brand !== null
                          ? (prod.brand as Brand).title
                          : String(prod.brand)}
                      </span>
                      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white">
                        {prod.title}
                      </h3>
                    </div>
                  </Link>
                  <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                    <AddToCartButton product={prod} />
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

              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
