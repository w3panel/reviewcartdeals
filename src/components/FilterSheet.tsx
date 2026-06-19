'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { FilterSelectField } from '@/components/FilterSelectField'
import type { Category } from '@/payload-types'
import { useFilterSheet } from '@/context/FilterSheetContext'

interface FilterSheetProps {
  categories: Category[]
  brands: string[]
  selectedCategory: string | null
  setSelectedCategory: (cat: string | null) => void
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  toggleBrand: (brand: string) => void
  handleClearAll: () => void
  totalDocs: number
}

type OpenField = 'category' | 'brand' | null

export function FilterSheet({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrands,
  setSelectedBrands,
  toggleBrand,
  handleClearAll,
  totalDocs,
}: FilterSheetProps) {
  const { isOpen, closeFilter } = useFilterSheet()
  const [openField, setOpenField] = useState<OpenField>(null)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.slug)
        .map((category) => ({
          value: category.slug as string,
          label: category.title,
        })),
    [categories],
  )

  const brandOptions = useMemo(
    () => brands.map((brand) => ({ value: brand, label: brand })),
    [brands],
  )

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (selectedBrands.length > 0 ? selectedBrands.length : 0)

  useEffect(() => {
    if (!isOpen) setOpenField(null)
  }, [isOpen])

  const toggleField = (field: Exclude<OpenField, null>) => {
    setOpenField((current) => (current === field ? null : field))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={closeFilter}
            className="rounded-full p-2 text-white transition-colors hover:bg-surface"
            aria-label="Close filters"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="font-serif text-2xl text-white">Filters</h2>
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Clear All
        </button>
      </div>

      <div className="luxury-panel flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="mx-auto max-w-2xl space-y-4">
          <FilterSelectField
            label="Category"
            value={selectedCategory}
            placeholder="All Categories"
            options={categoryOptions}
            isOpen={openField === 'category'}
            onToggle={() => toggleField('category')}
            onChange={setSelectedCategory}
          />

          <FilterSelectField
            label="Brand"
            value={selectedBrands[0] ?? null}
            placeholder="All Brands"
            options={brandOptions}
            isOpen={openField === 'brand'}
            onToggle={() => toggleField('brand')}
            onChange={(value) => setSelectedBrands(value ? [value] : [])}
          />

          {activeFilterCount > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedCategory ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {categoryOptions.find((option) => option.value === selectedCategory)?.label ??
                    selectedCategory}{' '}
                  ×
                </button>
              ) : null}
              {selectedBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {brand} ×
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border bg-black p-4 pb-safe">
        <div className="mx-auto flex max-w-2xl overflow-hidden rounded-xl bg-primary shadow-[0_-8px_32px_rgba(212,175,55,0.12)]">
          <button
            type="button"
            onClick={closeFilter}
            className="flex-1 px-4 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Apply Filters ({totalDocs.toLocaleString()})
          </button>
          <Link
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-14 items-center justify-center border-l border-primary-foreground/15 text-primary-foreground transition-colors hover:bg-primary-hover"
            aria-label="Contact on WhatsApp"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
