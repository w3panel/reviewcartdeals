'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, MessageCircle } from 'lucide-react'
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
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
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
        <button type="button" onClick={handleClearAll} className="text-sm font-medium text-primary">
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory ?? ''}
                onChange={(event) => setSelectedCategory(event.target.value || null)}
                className="w-full appearance-none rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-white outline-none focus:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug ?? ''}>
                    {category.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Brand
            </label>
            <div className="relative">
              <select
                value={selectedBrands[0] ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  setSelectedBrands(value ? [value] : [])
                }}
                className="w-full appearance-none rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-white outline-none focus:border-primary"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {selectedBrands.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className="rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary"
                >
                  {brand} ×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border p-4 pb-safe">
        <div className="mx-auto flex max-w-2xl overflow-hidden rounded-2xl bg-primary">
          <button
            type="button"
            onClick={closeFilter}
            className="flex-1 px-4 py-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Apply Filters ({totalDocs.toLocaleString()})
          </button>
          <Link
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-16 items-center justify-center border-l border-primary-foreground/15 bg-primary text-primary-foreground transition-colors hover:bg-primary-hover"
            aria-label="Contact on WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
