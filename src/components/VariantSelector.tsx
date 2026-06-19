'use client'

import React from 'react'
import Image from 'next/image'
import type { Product, ProductVariant } from '@/payload-types'
import {
  getPrimaryVisualType,
  getSelectableOptionChoices,
  getVariantOptionTypes,
  type SelectedVariantOptions,
} from '@/lib/productVariants'
import { getRelationshipId } from '@/lib/relationships'
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
  const variantGroups = getVariantOptionTypes(product, variants)
  const primaryVisualType = getPrimaryVisualType(variantGroups)

  const handleSelect = (groupId: number, valueId: number) => {
    onSelectOptions({
      ...selectedOptions,
      [String(groupId)]: valueId,
    })
  }

  if (variantGroups.length === 0) return null

  return (
    <div className="mt-6 space-y-5">
      {variantGroups.map((group) => {
        const choices = getSelectableOptionChoices(product, variants, group.id, selectedOptions)
        const selectedValueId = selectedOptions[String(group.id)]
        const showThumbnails = primaryVisualType?.id === group.id

        return (
          <div key={group.id}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {choices.map((choice) => {
                const isSelected = selectedValueId === choice.id
                const galleryRow = (product.valueGalleries ?? []).find(
                  (row) => getRelationshipId(row.value) === choice.id,
                )
                const thumb = galleryRow?.gallery?.[0]?.image

                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleSelect(group.id, choice.id)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    {showThumbnails && thumb ? (
                      <span className="flex items-center gap-2">
                        <span className="relative h-6 w-6 overflow-hidden rounded bg-muted">
                          <Image
                            src={getImageUrl(
                              typeof thumb === 'object' ? thumb : undefined,
                              'thumbnail',
                            )}
                            alt={choice.label}
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        </span>
                        {choice.label}
                      </span>
                    ) : (
                      choice.label
                    )}
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
