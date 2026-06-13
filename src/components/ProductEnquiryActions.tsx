'use client'

import React, { useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import type { Product, ProductVariant } from '@/payload-types'
import { formatVariantEnquiryDetails, hasVariants } from '@/lib/productVariants'
import { AddToCartButton } from '@/components/AddToCartButton'
import { VariantSelector } from '@/components/VariantSelector'

type ProductEnquiryActionsProps = {
  product: Product
  variants: ProductVariant[]
  whatsappLink: string
  selectedVariantId: string | null
  onSelectVariant: (variantId: string | null) => void
}

export function ProductEnquiryActions({
  product,
  variants,
  whatsappLink,
  selectedVariantId,
  onSelectVariant,
}: ProductEnquiryActionsProps) {
  const productHasVariants = hasVariants(product, variants)

  const selectedVariant = useMemo(
    () => variants.find((variant) => String(variant.id) === selectedVariantId) ?? null,
    [variants, selectedVariantId],
  )

  const enquiryWhatsappLink = useMemo(() => {
    if (!selectedVariant) return whatsappLink

    const url = new URL(whatsappLink)
    const message = decodeURIComponent(url.searchParams.get('text') ?? '')
    url.searchParams.set('text', `${message}\n${formatVariantEnquiryDetails(selectedVariant)}`)
    return url.toString()
  }, [whatsappLink, selectedVariant])

  return (
    <>
      {productHasVariants && (
        <VariantSelector
          product={product}
          variants={variants}
          selectedVariantId={selectedVariantId}
          onSelectVariant={onSelectVariant}
        />
      )}

      <div className={`flex flex-col gap-3 ${productHasVariants ? 'mt-6' : 'mt-6 sm:mt-8'}`}>
        <a
          href={enquiryWhatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 sm:gap-3 sm:text-sm ${
            productHasVariants && !selectedVariant ? 'pointer-events-none opacity-50' : ''
          }`}
          aria-disabled={productHasVariants && !selectedVariant}
          tabIndex={productHasVariants && !selectedVariant ? -1 : undefined}
        >
          <MessageCircle className="h-5 w-5" />
          Enquire via WhatsApp
        </a>
        <AddToCartButton
          product={product}
          variant={selectedVariant}
          disabled={productHasVariants && !selectedVariant}
        />
      </div>
    </>
  )
}
