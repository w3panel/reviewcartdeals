'use client'

import React, { useMemo, useState } from 'react'
import type { Media, Product, ProductVariant } from '@/payload-types'
import { buildVariantGalleryImages, hasVariants } from '@/lib/productVariants'
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() =>
    variants[0]?.id != null ? String(variants[0].id) : null,
  )

  const selectedVariant = useMemo(
    () => variants.find((variant) => String(variant.id) === selectedVariantId) ?? null,
    [variants, selectedVariantId],
  )

  const galleryImages = useMemo(() => {
    if (!productHasVariants || !selectedVariant) return defaultGalleryImages
    const variantImages = buildVariantGalleryImages(selectedVariant)
    return variantImages.length > 0 ? variantImages : defaultGalleryImages
  }, [productHasVariants, selectedVariant, defaultGalleryImages])

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
      <ProductGallery
        key={selectedVariantId ?? 'default'}
        images={galleryImages}
        title={product.title}
      />

      <div className="flex flex-col">
        {beforeActions}

        <ProductEnquiryActions
          product={product}
          variants={variants}
          whatsappLink={whatsappLink}
          selectedVariantId={selectedVariantId}
          onSelectVariant={setSelectedVariantId}
        />

        {afterActions}
      </div>
    </div>
  )
}
