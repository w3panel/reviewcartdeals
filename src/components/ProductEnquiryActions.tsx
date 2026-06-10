'use client'

import React, { useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import type { Product } from '@/payload-types'
import { formatVariantEnquiryDetails, hasVariants } from '@/lib/productVariants'
import { AddToCartButton } from '@/components/AddToCartButton'
import { VariantSelector } from '@/components/VariantSelector'

type ProductEnquiryActionsProps = {
  product: Product
  whatsappLink: string
  selectedVariantId: string | null
  onSelectVariant: (variantId: string | null) => void
}

export function ProductEnquiryActions({
  product,
  whatsappLink,
  selectedVariantId,
  onSelectVariant,
}: ProductEnquiryActionsProps) {
  const variants = product.variants ?? []
  const productHasVariants = hasVariants(product)

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
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
          className={`inline-flex w-full items-center justify-center gap-2 sm:gap-3 rounded-xl bg-whatsapp px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:opacity-90 transition-opacity ${
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
