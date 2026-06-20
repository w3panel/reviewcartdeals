'use client'

import React, { useMemo } from 'react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import type { Product, ProductVariant } from '@/payload-types'
import {
  formatSelectedOptionsDetails,
  formatVariantEnquiryDetails,
  getVariantOptionTypes,
  type SelectedVariantOptions,
} from '@/lib/productVariants'
import { AddToCartButton } from '@/components/AddToCartButton'
import { VariantSelector } from '@/components/VariantSelector'

type ProductEnquiryActionsProps = {
  product: Product
  variants: ProductVariant[]
  whatsappLink: string | null
  selectedOptions: SelectedVariantOptions
  onSelectOptions: (selectedOptions: SelectedVariantOptions) => void
  selectedVariant: ProductVariant | null
  showVariantSelector: boolean
  requireVariantSelection: boolean
}

export function ProductEnquiryActions({
  product,
  variants,
  whatsappLink,
  selectedOptions,
  onSelectOptions,
  selectedVariant,
  showVariantSelector,
  requireVariantSelection,
}: ProductEnquiryActionsProps) {
  const enquiryWhatsappLink = useMemo(() => {
    if (!whatsappLink) return null

    try {
      const url = new URL(whatsappLink)
      const message = decodeURIComponent(url.searchParams.get('text') ?? '')
      const variantDetails = selectedVariant
        ? formatVariantEnquiryDetails(selectedVariant)
        : formatSelectedOptionsDetails(
            product,
            variants,
            selectedOptions,
            getVariantOptionTypes(product, variants),
          )
      const extraDetails = variantDetails ? `\n${variantDetails}` : ''

      if (extraDetails) {
        url.searchParams.set('text', `${message}${extraDetails}`)
      }

      return url.toString()
    } catch {
      return null
    }
  }, [whatsappLink, selectedVariant, product, variants, selectedOptions])

  const selectionIncomplete = requireVariantSelection && !selectedVariant
  const whatsappDisabled = selectionIncomplete || !enquiryWhatsappLink

  return (
    <>
      {showVariantSelector && (
        <VariantSelector
          product={product}
          variants={variants}
          selectedOptions={selectedOptions}
          onSelectOptions={onSelectOptions}
        />
      )}

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={enquiryWhatsappLink ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 sm:gap-3 sm:text-sm ${
            whatsappDisabled ? 'pointer-events-none opacity-50' : ''
          }`}
          aria-disabled={whatsappDisabled}
          tabIndex={whatsappDisabled ? -1 : undefined}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Enquire via WhatsApp
        </a>
        <AddToCartButton
          product={product}
          variant={selectedVariant}
          disabled={selectionIncomplete}
        />
      </div>
    </>
  )
}
