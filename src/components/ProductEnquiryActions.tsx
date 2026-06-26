'use client'

import React, { useMemo } from 'react'
import { ShoppingBag } from 'lucide-react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import type { Product, ProductVariant } from '@/payload-types'
import {
  buildCartVariantFromSelection,
  getVariantOptionTypes,
  formatSelectedOptionsDetails,
  formatVariantEnquiryDetails,
  type SelectedVariantOptions,
} from '@/lib/productVariants'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { VariantSelector } from '@/components/VariantSelector'
import { buildProductEnquiryWhatsAppMessage, getSiteUrl, getWhatsAppUrl } from '@/lib/siteConfig'

type ProductEnquiryActionsProps = {
  product: Product
  variants: ProductVariant[]
  selectedOptions: SelectedVariantOptions
  onSelectOptions: (selectedOptions: SelectedVariantOptions) => void
  selectedVariant: ProductVariant | null
  showVariantSelector: boolean
  requireVariantSelection: boolean
}

export function ProductEnquiryActions({
  product,
  variants,
  selectedOptions,
  onSelectOptions,
  selectedVariant,
  showVariantSelector,
  requireVariantSelection,
}: ProductEnquiryActionsProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const hasSpecifications = Boolean(product.specifications && product.specifications.length > 0)

  const enquiryWhatsappLink = useMemo(() => {
    let message = buildProductEnquiryWhatsAppMessage(product, getSiteUrl())
    const variantDetails = selectedVariant
      ? formatVariantEnquiryDetails(selectedVariant)
      : formatSelectedOptionsDetails(
          product,
          variants,
          selectedOptions,
          getVariantOptionTypes(product, variants),
        )

    if (variantDetails) {
      message = `${message}\n${variantDetails}`
    }

    return getWhatsAppUrl(message)
  }, [selectedVariant, product, variants, selectedOptions])

  const selectionIncomplete = requireVariantSelection && !selectedVariant
  const whatsappDisabled = selectionIncomplete || !enquiryWhatsappLink

  const handleAddToEnquiry = () => {
    if (selectionIncomplete) return

    const variantGroups = getVariantOptionTypes(product, variants)
    const cartVariant =
      variantGroups.length > 0
        ? buildCartVariantFromSelection({
            product,
            variants,
            selectedOptions,
            selectedVariant,
            groups: variantGroups,
          })
        : null

    addItem(product, cartVariant)
    router.push('/cart')
  }

  return (
    <>
      {showVariantSelector && (
        <VariantSelector
          product={product}
          variants={variants}
          selectedOptions={selectedOptions}
          onSelectOptions={onSelectOptions}
          showSizeChartLink={hasSpecifications}
        />
      )}

      <div className="mt-8 flex flex-col gap-3">
        <a
          href={enquiryWhatsappLink ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-whatsapp bg-transparent px-6 py-4 text-xs font-bold uppercase tracking-wider text-whatsapp transition-colors hover:bg-whatsapp/10 sm:gap-3 sm:text-sm ${
            whatsappDisabled ? 'pointer-events-none opacity-50' : ''
          }`}
          aria-disabled={whatsappDisabled}
          tabIndex={whatsappDisabled ? -1 : undefined}
        >
          <WhatsAppIcon className="h-5 w-5" />
          Enquire via WhatsApp
        </a>
        <button
          type="button"
          onClick={handleAddToEnquiry}
          disabled={selectionIncomplete}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-transparent px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
        >
          <ShoppingBag className="h-5 w-5" />
          Add to Enquiry
        </button>
      </div>
    </>
  )
}
