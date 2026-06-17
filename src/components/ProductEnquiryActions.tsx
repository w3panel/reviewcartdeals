'use client'

import React, { useMemo } from 'react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import type { Product, ProductVariant } from '@/payload-types'
import { formatProductAttributesDetails } from '@/lib/productAttributes'
import {
  formatVariantEnquiryDetails,
  hasVariants,
  type SelectedVariantOptions,
} from '@/lib/productVariants'
import { AddToCartButton } from '@/components/AddToCartButton'
import { VariantSelector } from '@/components/VariantSelector'

type ProductEnquiryActionsProps = {
  product: Product
  variants: ProductVariant[]
  whatsappLink: string
  selectedOptions: SelectedVariantOptions
  onSelectOptions: (selectedOptions: SelectedVariantOptions) => void
  selectedVariant: ProductVariant | null
}

export function ProductEnquiryActions({
  product,
  variants,
  whatsappLink,
  selectedOptions,
  onSelectOptions,
  selectedVariant,
}: ProductEnquiryActionsProps) {
  const productHasVariants = hasVariants(product, variants)

  const enquiryWhatsappLink = useMemo(() => {
    const url = new URL(whatsappLink)
    const message = decodeURIComponent(url.searchParams.get('text') ?? '')
    const attributeDetails = formatProductAttributesDetails(product)
    const variantDetails = selectedVariant ? formatVariantEnquiryDetails(selectedVariant) : ''
    const extraDetails = [attributeDetails, variantDetails].filter(Boolean).join('\n')

    if (extraDetails) {
      url.searchParams.set('text', `${message}\n${extraDetails}`)
    }

    return url.toString()
  }, [whatsappLink, product, selectedVariant])

  return (
    <>
      {productHasVariants && (
        <VariantSelector
          product={product}
          variants={variants}
          selectedOptions={selectedOptions}
          onSelectOptions={onSelectOptions}
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
          <WhatsAppIcon className="h-5 w-5" />
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
