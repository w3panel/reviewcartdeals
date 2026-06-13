'use client'

import React from 'react'
import Link from 'next/link'
import { ProductReviewCard, type ProductWithStats } from '@/components/ProductReviewCard'

type FeaturedReviewsProps = {
  products: ProductWithStats[]
}

export function FeaturedReviews({ products }: FeaturedReviewsProps) {
  if (products.length === 0) return null

  return (
    <section className="px-4 pt-10 md:pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-white sm:text-2xl">Featured Reviews</h2>
          <Link href="/search" className="text-sm text-primary underline underline-offset-4">
            View all
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {products.slice(0, 8).map((product) => (
            <ProductReviewCard
              key={product.id}
              product={product}
              className="w-[260px] flex-shrink-0 sm:w-[280px]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
