'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { SafeImage } from '@/components/SafeImage'
import type { Media, Product, ProductVariant } from '@/payload-types'
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
  showSizeChartLink?: boolean
}

function getChoiceThumbnail(product: Product, choiceId: number): Media | undefined {
  const galleryRow = (product.valueGalleries ?? []).find(
    (row) => getRelationshipId(row.value) === choiceId,
  )
  const image = galleryRow?.gallery?.[0]?.image
  return typeof image === 'object' && image !== null ? image : undefined
}

export function VariantSelector({
  product,
  variants,
  selectedOptions,
  onSelectOptions,
  showSizeChartLink = false,
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
    <div className="mt-8 space-y-8">
      {variantGroups.map((group) => {
        const choices = getSelectableOptionChoices(product, variants, group.id, selectedOptions)
        const selectedValueId = selectedOptions[String(group.id)]
        const selectedChoice = choices.find((choice) => choice.id === selectedValueId)
        const isVisualGroup =
          group.isVisual ||
          primaryVisualType?.id === group.id ||
          choices.some((choice) => Boolean(getChoiceThumbnail(product, choice.id)))

        if (isVisualGroup) {
          return (
            <div key={group.id}>
              <p className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
                {group.label}
                {selectedChoice ? `: ${selectedChoice.label}` : ''}
              </p>
              <div className="flex flex-wrap gap-3">
                {choices.map((choice) => {
                  const isSelected = selectedValueId === choice.id
                  const thumb = getChoiceThumbnail(product, choice.id)

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSelect(group.id, choice.id)}
                      aria-label={choice.label}
                      aria-pressed={isSelected}
                      title={choice.label}
                      className={`relative h-16 w-16 overflow-hidden rounded-md border-2 transition-colors sm:h-[4.5rem] sm:w-[4.5rem] ${
                        isSelected ? 'border-primary' : 'border-border/80 hover:border-primary/40'
                      }`}
                    >
                      {thumb ? (
                        <SafeImage
                          src={getImageUrl(thumb, 'thumbnail')}
                          alt={choice.label}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-muted text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {choice.label.slice(0, 2)}
                        </span>
                      )}
                      {isSelected ? (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-sm">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }

        return (
          <div key={group.id}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-bold uppercase tracking-wide text-white">
                Select {group.label}
              </p>
              {showSizeChartLink && group.label.toLowerCase().includes('size') ? (
                <a
                  href="#specifications"
                  className="text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-primary-hover"
                >
                  Size Chart
                </a>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {choices.map((choice) => {
                const isSelected = selectedValueId === choice.id

                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleSelect(group.id, choice.id)}
                    aria-pressed={isSelected}
                    className={`min-w-[3.25rem] rounded-md border px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                      isSelected
                        ? 'border-primary bg-transparent text-white'
                        : 'border-border/80 bg-transparent text-white/90 hover:border-primary/50'
                    }`}
                  >
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
