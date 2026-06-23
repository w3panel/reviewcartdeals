'use client'

import React from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { SafeImage } from '@/components/SafeImage'
import { getImageUrl, getProductBrandTitle, getProductMainImage } from '@/lib/utils'
import { getWhatsAppUrl } from '@/lib/siteConfig'
import type { Product } from '@/payload-types'

export type ProductWithStats = Product & {
  stats?: {
    averageRating?: number
    totalReviews?: number
  }
}

type ProductCardProps = {
  product: ProductWithStats
  className?: string
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const whatsappHref = getWhatsAppUrl(
    `Hello, I am interested in ${product.title}. Can you share more details?`,
  )
  const brandTitle = getProductBrandTitle(product)
  const rating = product.stats?.averageRating
  const hasRating = typeof rating === 'number' && rating > 0
  const reviewCount = product.stats?.totalReviews ?? 0
  const hasReviews = reviewCount > 0
  const showRating = hasRating || hasReviews

  return (
    <article
      className={`group relative flex w-full flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111] shadow-[0_8px_30px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_44px_rgba(0,0,0,0.52),inset_0_1px_0_0_rgba(255,255,255,0.08)] ${className}`}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-t-[20px] bg-black"
      >
        <SafeImage
          src={getImageUrl(getProductMainImage(product), 'card')}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {brandTitle ? (
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
            {brandTitle}
          </span>
        ) : null}

        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-snug text-white transition-colors hover:text-primary"
        >
          {product.title}
        </Link>

        {showRating ? (
          <div className="flex items-center gap-2">
            {hasRating ? (
              <div className="flex items-center" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-3.5 w-3.5 ${
                      index < Math.round(rating!) ? 'fill-primary text-primary' : 'text-white/15'
                    }`}
                  />
                ))}
              </div>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {hasRating ? rating!.toFixed(1) : null}
              {hasReviews ? (
                <>
                  {hasRating ? ' ' : null}({reviewCount})
                </>
              ) : null}
            </span>
          </div>
        ) : null}

        <div className="mt-auto flex gap-3 pt-1">
          <Link
            href={`/product/${product.slug}`}
            className="flex h-11 flex-1 items-center justify-center rounded-[14px] bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors duration-200 hover:bg-primary-hover"
          >
            Review
          </Link>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary-hover"
              aria-label={`WhatsApp enquiry for ${product.title}`}
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
