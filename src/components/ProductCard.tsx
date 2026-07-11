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
import { buildProductEnquiryWhatsAppMessage, getSiteUrl, getWhatsAppUrl } from '@/lib/siteConfig'
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

const reviewButtonClassName =
  'flex items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary-hover'

const whatsappButtonClassName =
  'flex items-center justify-center rounded-xl border border-primary bg-surface text-primary transition-colors duration-200 hover:bg-card'

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const whatsappHref = getWhatsAppUrl(buildProductEnquiryWhatsAppMessage(product, getSiteUrl()))
  const brandTitle = getProductBrandTitle(product)
  const overlayLabel = getProductCardOverlayLabel(product)

  return (
    <article
      className={`group relative flex w-full flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-[0_4px_20px_rgba(45,36,30,0.06)] transition-colors duration-300 hover:border-primary/30 ${className}`}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-surface"
      >
        <SafeImage
          src={getImageUrl(getProductMainImage(product), 'card')}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {overlayLabel ? (
          <span className="absolute bottom-3 left-3 font-serif text-sm lowercase text-primary-foreground sm:bottom-4 sm:left-4 sm:text-base">
            {overlayLabel}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 bg-card p-3 sm:gap-3 sm:p-4">
        {brandTitle ? (
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:text-[10px] sm:tracking-[0.22em]">
            {brandTitle}
          </span>
        ) : null}

        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-accent sm:text-[15px]"
        >
          {product.title}
        </Link>

        <div className="mt-auto flex gap-2 pt-1 sm:gap-3 sm:pt-2">
          <Link
            href={`/product/${product.slug}`}
            className={`${reviewButtonClassName} h-10 flex-1 text-[10px] font-semibold tracking-wide sm:h-11 sm:text-xs`}
          >
            Review
          </Link>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${whatsappButtonClassName} h-10 w-10 flex-shrink-0 sm:h-11 sm:w-11`}
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
