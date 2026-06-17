'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { getImageUrl, getProductMainImage } from '@/lib/utils'
import type { Product, Category, Brand } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'

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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <div className="hidden lg:col-span-1 lg:block">
        <div className="sticky top-28 rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Filters
            </h2>
          </div>

          <form method="GET" className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Search Text
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Keyword..."
                  className="w-full rounded-2xl border border-border bg-surface py-3 pl-9 pr-3 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Category
              </label>
              <select
                name="category"
                defaultValue={category || 'ALL'}
                className="w-full rounded-2xl border border-border bg-surface px-3 py-3 text-xs text-white focus:border-primary focus:outline-none"
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
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Brand
              </label>
              <select
                name="brand"
                defaultValue={brand || 'ALL'}
                className="w-full rounded-2xl border border-border bg-surface px-3 py-3 text-xs text-white focus:border-primary focus:outline-none"
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
              className="w-full rounded-2xl bg-primary py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Apply Filters
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-3">
        <form method="GET" className="mb-6 flex flex-col gap-3 lg:hidden">
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="w-full rounded-2xl border border-border bg-surface py-3 pl-10 pr-3 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              name="category"
              defaultValue={category || 'ALL'}
              className="rounded-2xl border border-border bg-surface px-3 py-3 text-xs text-white focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.title}
                </option>
              ))}
            </select>
            <select
              name="brand"
              defaultValue={brand || 'ALL'}
              className="rounded-2xl border border-border bg-surface px-3 py-3 text-xs text-white focus:border-primary focus:outline-none"
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
            className="rounded-2xl bg-primary py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground"
          >
            Apply Filters
          </button>
        </form>

        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {loading ? 'Searching...' : `Found ${totalDocs} Products`}
          </span>
          {(q || category || brand) && (
            <Link
              href="/search"
              className="text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
            >
              Reset All
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No products found matching your filters.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-block border-b border-primary pb-0.5 text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-grow flex-col p-3 sm:p-4">
                        <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                          {typeof prod.brand === 'object' && prod.brand !== null
                            ? (prod.brand as Brand).title
                            : String(prod.brand)}
                        </span>
                        <h3 className="mb-2 line-clamp-2 flex-grow text-sm font-medium leading-snug text-white">
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
                    href={`/search?q=${q}&category=${category}&brand=${brand}&page=${currentPage - 1}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                ) : (
                  <div className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-border/50 text-muted-foreground">
                    <ChevronLeft className="h-5 w-5" />
                  </div>
                )}

                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  PAGE {currentPage} OF {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={`/search?q=${q}&category=${category}&brand=${brand}&page=${currentPage + 1}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <div className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-border/50 text-muted-foreground">
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
