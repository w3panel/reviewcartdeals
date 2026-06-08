'use client'

import React from 'react'
import { X, Check } from 'lucide-react'

interface SortSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function SortSheet({ isOpen, onClose }: SortSheetProps) {
  const [selectedSort, setSelectedSort] = React.useState('Popular')

  if (!isOpen) return null

  const sortOptions = ['Popular', 'Newest', 'Rating']

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-background w-full rounded-t-3xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">Sort By</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-muted rounded-full"
            aria-label="Close sort"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
          {sortOptions.map((option, idx) => {
            const isSelected = selectedSort === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedSort(option)}
                className={`flex items-center justify-between w-full py-5 text-base font-medium ${
                  idx !== sortOptions.length - 1 ? 'border-b border-border/50' : ''
                } ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {option}
                {isSelected && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-background pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-base font-bold"
          >
            Apply Sort
          </button>
        </div>
      </div>
    </div>
  )
}
