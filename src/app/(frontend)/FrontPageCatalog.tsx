'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import type { ProductWithStats } from '@/components/ProductReviewCard'
import { ProductReviewCard } from '@/components/ProductReviewCard'
import { buildCatalogSearchUrl, catalogSortToLabel, type CatalogSort } from '@/lib/catalogUrl'

const SortSheet = dynamic(() =>
  import('@/components/SortSheet').then((mod) => ({ default: mod.SortSheet })),
)

interface FrontPageCatalogProps {
  initialProducts: ProductWithStats[]
  initialTotalDocs: number
}

export function FrontPageCatalog({ initialProducts, initialTotalDocs }: FrontPageCatalogProps) {
  const router = useRouter()
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [selectedSort, setSelectedSort] = useState<CatalogSort>('popular')

  return (
    <>
      <section className="px-4 pb-20 pt-2 md:pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between border-t border-border pt-6">
            <div>
              <h2 className="font-serif text-xl text-white sm:text-2xl">All Products</h2>
              <Link
                href={buildCatalogSearchUrl()}
                className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-4"
              >
                Browse / Filter Catalog
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setIsSortOpen(true)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
            >
              Sort by: {catalogSortToLabel(selectedSort)} <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            {initialTotalDocs.toLocaleString()} products
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {initialProducts.map((product) => (
              <ProductReviewCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {isSortOpen ? (
        <SortSheet
          isOpen={isSortOpen}
          value={selectedSort}
          onClose={() => setIsSortOpen(false)}
          onApply={(sort) => {
            setSelectedSort(sort)
            setIsSortOpen(false)
            router.push(buildCatalogSearchUrl({ sort }))
          }}
        />
      ) : null}
    </>
  )
}
