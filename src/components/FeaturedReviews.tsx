import React from 'react'
import Link from 'next/link'
import { ProductCard, type ProductWithStats } from '@/components/ProductCard'
import { ProductCardGrid } from '@/components/ProductCardGrid'

type FeaturedReviewsProps = {
  products: ProductWithStats[]
}

export function FeaturedReviews({ products }: FeaturedReviewsProps) {
  if (products.length === 0) return null

  return (
    <section className="px-4 pb-10 pt-8 md:pb-12 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl text-white sm:text-2xl">Featured Reviews</h2>
          <Link
            href="/search"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            View all
          </Link>
        </div>

        <ProductCardGrid>
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductCardGrid>
      </div>
    </section>
  )
}
