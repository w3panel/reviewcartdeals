'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, Star } from 'lucide-react'
import { getImageUrl, getProductMainImage } from '@/lib/utils'
import type { Brand, Product } from '@/payload-types'

export type ProductWithStats = Product & {
  stats?: {
    averageRating?: number
    totalReviews?: number
  }
}

type ProductReviewCardProps = {
  product: ProductWithStats
  className?: string
}

export function ProductReviewCard({ product, className = '' }: ProductReviewCardProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
  const brandTitle =
    typeof product.brand === 'object' && product.brand !== null
      ? (product.brand as Brand).title
      : String(product.brand)
  const rating = product.stats?.averageRating
  const reviewCount = product.stats?.totalReviews ?? 0
  const whatsappMessage = `Hello, I am interested in ${product.title}. Can you share more details?`

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card ${className}`}
    >
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] bg-black">
        <Image
          src={getImageUrl(getProductMainImage(product))}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-contain p-4"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          {brandTitle}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-white hover:text-primary"
        >
          {product.title}
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-3.5 w-3.5 ${
                  rating && index < Math.round(rating) ? 'fill-primary text-primary' : 'text-border'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {rating ? rating.toFixed(1) : '—'}
            {reviewCount > 0 ? ` (${reviewCount})` : ''}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="flex flex-1 items-center justify-center rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Review
          </Link>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-primary text-primary transition-colors hover:bg-primary/10"
            aria-label={`WhatsApp enquiry for ${product.title}`}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  )
}
