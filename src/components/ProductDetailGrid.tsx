'use client'

import React, { useMemo, useState } from 'react'
import type { Media, Product, ProductVariant } from '@/payload-types'
import {
  getInitialSelectedOptions,
  getPrimaryVisualType,
  getVariantOptionTypes,
  hasVariants,
  resolveGalleryImages,
  resolveSelectedOptionValue,
  resolveSelectedVariant,
  type SelectedVariantOptions,
} from '@/lib/productVariants'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductEnquiryActions } from '@/components/ProductEnquiryActions'

type ProductDetailGridProps = {
  product: Product
  variants: ProductVariant[]
  defaultGalleryImages: Media[]
  whatsappLink: string
  beforeActions: React.ReactNode
  afterActions?: React.ReactNode
}

export function ProductDetailGrid({
  product,
  variants,
  defaultGalleryImages,
  whatsappLink,
  beforeActions,
  afterActions,
}: ProductDetailGridProps) {
  const productHasVariants = hasVariants(product, variants)
  const variantOptionTypes = getVariantOptionTypes(product, variants)

  const [selectedOptions, setSelectedOptions] = useState<SelectedVariantOptions>(() =>
    variants[0] ? getInitialSelectedOptions(variants[0]) : {},
  )

  const selectedVariant = useMemo(
    () => resolveSelectedVariant(variants, selectedOptions, variantOptionTypes),
    [variants, selectedOptions, variantOptionTypes],
  )

  const galleryImages = useMemo(() => {
    if (!productHasVariants) return defaultGalleryImages
    return resolveGalleryImages(variants, selectedOptions, variantOptionTypes, defaultGalleryImages)
  }, [productHasVariants, variants, selectedOptions, variantOptionTypes, defaultGalleryImages])

  const galleryType = getPrimaryVisualType(variantOptionTypes)
  const galleryOptionValueId = galleryType
    ? resolveSelectedOptionValue(variants, selectedOptions, galleryType.id)?.id
    : undefined

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
      <ProductGallery
        key={galleryOptionValueId ?? 'default'}
        images={galleryImages}
        title={product.title}
      />

      <div className="flex flex-col">
        {beforeActions}

        <ProductEnquiryActions
          product={product}
          variants={variants}
          whatsappLink={whatsappLink}
          selectedOptions={selectedOptions}
          onSelectOptions={setSelectedOptions}
          selectedVariant={selectedVariant}
        />

        {afterActions}
      </div>
    </div>
  )
}
