import React from 'react'
import Link from 'next/link'
import { ProductReviewCard, type ProductWithStats } from '@/components/ProductReviewCard'

type FeaturedReviewsProps = {
  products: ProductWithStats[]
}

export function FeaturedReviews({ products }: FeaturedReviewsProps) {
  if (products.length === 0) return null

  return (
    <section className="px-4 pt-8 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-white sm:text-2xl">Featured Reviews</h2>
          <Link href="/search" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:gap-4">
          {products.slice(0, 8).map((product) => (
            <ProductReviewCard
              key={product.id}
              product={product}
              variant="featured"
              className="w-[220px] flex-shrink-0 sm:w-[240px]"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
