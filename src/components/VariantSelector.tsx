'use client'

import React from 'react'
import Image from 'next/image'
import type { Product } from '@/payload-types'
import { formatVariantLabel, getVariantThumbnail, type ProductVariant } from '@/lib/productVariants'
import { getImageUrl } from '@/lib/utils'

type VariantSelectorProps = {
  product: Product
  variants: ProductVariant[]
  selectedVariantId: string | null
  onSelectVariant: (variantId: string | null) => void
}

export function VariantSelector({
  product,
  variants,
  selectedVariantId,
  onSelectVariant,
}: VariantSelectorProps) {
  return (
    <div className="mt-6 sm:mt-8">
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
        Select Variant
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {variants.map((variant, index) => {
          const isSelected = variant.id === selectedVariantId
          const thumbnail = getVariantThumbnail(variant, product)
          const label = formatVariantLabel(variant, index)

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelectVariant(variant.id ?? null)}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all ${
                isSelected
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="relative aspect-square w-full bg-muted border-b border-border">
                <Image
                  src={getImageUrl(thumbnail)}
                  alt={label}
                  fill
                  sizes="(max-width: 640px) 50vw, 160px"
                  className="object-contain p-3"
                />
              </div>
              <div className="flex flex-col gap-1 p-3">
                <span className="text-[10px] sm:text-xs font-semibold text-foreground leading-snug line-clamp-4">
                  {label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
