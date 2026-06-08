'use client'

import React from 'react'
import { X, Search, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import type { Category } from '@/payload-types'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  brands: string[]
  selectedCategory: string | null
  setSelectedCategory: (cat: string | null) => void
  selectedBrands: string[]
  toggleBrand: (brand: string) => void
  handleClearAll: () => void
  totalDocs: number
}

export function FilterSheet({
  isOpen, onClose, categories, brands,
  selectedCategory, setSelectedCategory,
  selectedBrands, toggleBrand, handleClearAll, totalDocs,
}: FilterSheetProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-background w-full rounded-t-3xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="p-1" aria-label="Close filters">
              <X className="w-6 h-6 text-foreground" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Filters</h2>
          </div>
          <button type="button" onClick={handleClearAll} className="text-sm font-medium text-primary">
            Reset
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-8 no-scrollbar">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">
              Categories
            </h3>
            <div className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug!)}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors overflow-hidden ${
                    selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {cat.image ? (
                      <div className="w-full h-full relative">
                        <Image src={getImageUrl(cat.image)} alt={cat.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="text-xl font-bold">{cat.title.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground">{cat.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Brand</h3>
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {brands.map((brand) => {
                const isSelected = selectedBrands.includes(brand)
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className="flex items-center gap-3 w-full"
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-primary border-primary' : 'border-border bg-transparent'
                    }`}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{brand}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-background border-t border-border pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-base font-bold"
          >
            Show {totalDocs.toLocaleString()} Results
          </button>
        </div>
      </div>
    </div>
  )
}
