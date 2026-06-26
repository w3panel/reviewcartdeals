'use client'

import React, { useMemo, useState } from 'react'
import type { Product, ProductVariant } from '@/payload-types'
import {
  getDefaultGalleryImages,
  getInitialSelectedOptionsForProduct,
  getPrimaryVisualType,
  getVariantOptionTypes,
  hasVariants,
  resolveGalleryImages,
  resolveSelectedVariant,
  shouldShowVariantSelector,
  usesVisualVariantGallery,
  type SelectedVariantOptions,
} from '@/lib/productVariants'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductEnquiryActions } from '@/components/ProductEnquiryActions'

type ProductDetailGridProps = {
  product: Product
  variants: ProductVariant[]
  beforeActions: React.ReactNode
  afterActions?: React.ReactNode
}

export function ProductDetailGrid({
  product,
  variants,
  beforeActions,
  afterActions,
}: ProductDetailGridProps) {
  const productHasVariants = hasVariants(product, variants)
  const variantGroups = getVariantOptionTypes(product, variants)
  const visualGallery = usesVisualVariantGallery(product, variants)
  const defaultGalleryImages = useMemo(() => getDefaultGalleryImages(product), [product])

  const [selectedOptions, setSelectedOptions] = useState<SelectedVariantOptions>(() =>
    getInitialSelectedOptionsForProduct(product, variants, variantGroups),
  )

  const selectedVariant = useMemo(
    () => resolveSelectedVariant(variants, selectedOptions, variantGroups),
    [variants, selectedOptions, variantGroups],
  )

  const galleryImages = useMemo(() => {
    if (visualGallery) {
      return resolveGalleryImages(product, selectedOptions, variantGroups, defaultGalleryImages)
    }
    return defaultGalleryImages
  }, [visualGallery, product, selectedOptions, variantGroups, defaultGalleryImages])

  const visualGroup = getPrimaryVisualType(variantGroups)
  const galleryKey = visualGroup ? selectedOptions[String(visualGroup.id)] : 'default'

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
      <ProductGallery key={galleryKey ?? 'default'} images={galleryImages} title={product.title} />

      <div className="flex flex-col">
        {beforeActions}

        <ProductEnquiryActions
          product={product}
          variants={variants}
          selectedOptions={selectedOptions}
          onSelectOptions={setSelectedOptions}
          selectedVariant={selectedVariant}
          showVariantSelector={shouldShowVariantSelector(product, variants)}
          requireVariantSelection={productHasVariants}
        />

        {afterActions}
      </div>
    </div>
  )
}
