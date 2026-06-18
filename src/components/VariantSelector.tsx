'use client'

import React, { useCallback } from 'react'
import Image from 'next/image'
import type { Product, ProductVariant } from '@/payload-types'
import {
  getPrimaryVisualType,
  getSelectableOptionChoices,
  getVariantOptionTypes,
  isOptionValueSelectable,
  pruneSelectedOptions,
  type SelectedVariantOptions,
} from '@/lib/productVariants'
import { getOptionChoiceThumbnail } from '@/lib/productVisualGalleries'
import { getImageUrl } from '@/lib/utils'

type VariantSelectorProps = {
  product: Product
  variants: ProductVariant[]
  selectedOptions: SelectedVariantOptions
  onSelectOptions: (selectedOptions: SelectedVariantOptions) => void
}

export function VariantSelector({
  product,
  variants,
  selectedOptions,
  onSelectOptions,
}: VariantSelectorProps) {
  const variantOptionTypes = getVariantOptionTypes(product, variants)
  const primaryVisualType = getPrimaryVisualType(variantOptionTypes)

  const handleSelect = useCallback(
    (typeId: number, optionValueId: string) => {
      const typeKey = String(typeId)
      const nextSelection = pruneSelectedOptions(
        variants,
        {
          ...selectedOptions,
          [typeKey]: optionValueId,
        },
        variantOptionTypes,
      )
      onSelectOptions(nextSelection)
    },
    [variants, selectedOptions, variantOptionTypes, onSelectOptions],
  )

  if (variantOptionTypes.length === 0) return null

  return (
    <div className="mt-6 space-y-5 sm:mt-8">
      {variantOptionTypes.map((variantType) => {
        const typeKey = String(variantType.id)
        const choices = getSelectableOptionChoices(variants, variantType.id, selectedOptions)
        const selectedValue = selectedOptions[typeKey]
        const showThumbnails = primaryVisualType?.id === variantType.id

        return (
          <div key={variantType.id}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              {variantType.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {choices.map((choice) => {
                const isSelected = selectedValue === choice.id
                const isSelectable = isOptionValueSelectable(
                  variants,
                  variantType.id,
                  choice.id,
                  selectedOptions,
                )
                const thumbnail = showThumbnails
                  ? getOptionChoiceThumbnail(product, choice.id)
                  : null

                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={!isSelectable}
                    onClick={() => handleSelect(variantType.id, choice.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isSelectable
                          ? 'border-border bg-card text-foreground hover:border-primary/50'
                          : 'cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground opacity-50'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {thumbnail ? (
                      <span className="relative h-5 w-5 overflow-hidden rounded-full border border-border/60">
                        <Image
                          src={getImageUrl(thumbnail)}
                          alt=""
                          fill
                          sizes="20px"
                          className="object-cover"
                        />
                      </span>
                    ) : null}
                    {choice.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
