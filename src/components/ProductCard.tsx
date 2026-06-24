'use client'

import React from 'react'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { SafeImage } from '@/components/SafeImage'
import {
  getImageUrl,
  getProductBrandTitle,
  getProductCardOverlayLabel,
  getProductMainImage,
} from '@/lib/utils'
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

const outlineActionClassName =
  'flex items-center justify-center rounded-xl border border-primary bg-transparent text-primary transition-colors duration-200 hover:bg-primary/10'

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const whatsappHref = getWhatsAppUrl(
    `Hello, I am interested in ${product.title}. Can you share more details?`,
  )
  const brandTitle = getProductBrandTitle(product)
  const overlayLabel = getProductCardOverlayLabel(product)

  return (
    <article
      className={`group relative flex w-full flex-col overflow-hidden rounded-[20px] border border-white/10 bg-black transition-colors duration-300 hover:border-primary/40 ${className}`}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-black"
      >
        <SafeImage
          src={getImageUrl(getProductMainImage(product), 'card')}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {overlayLabel ? (
          <span className="absolute bottom-3 left-3 font-serif text-sm lowercase text-white/95 sm:bottom-4 sm:left-4 sm:text-base">
            {overlayLabel}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 bg-black p-3 sm:gap-3 sm:p-4">
        {brandTitle ? (
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary sm:text-[10px] sm:tracking-[0.22em]">
            {brandTitle}
          </span>
        ) : null}

        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug text-white transition-colors hover:text-primary sm:text-[15px]"
        >
          {product.title}
        </Link>

        <div className="mt-auto flex gap-2 pt-1 sm:gap-3 sm:pt-2">
          <Link
            href={`/product/${product.slug}`}
            className={`${outlineActionClassName} h-10 flex-1 text-[10px] font-semibold tracking-wide sm:h-11 sm:text-xs`}
          >
            Review
          </Link>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${outlineActionClassName} h-10 w-10 flex-shrink-0 sm:h-11 sm:w-11`}
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
