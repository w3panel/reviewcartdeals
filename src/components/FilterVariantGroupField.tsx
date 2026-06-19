'use client'

import React from 'react'
import { FilterMultiSelectField } from '@/components/FilterMultiSelectField'
import type { CatalogVariantGroupFilter } from '@/lib/catalogFilterTypes'
import { getVariantSwatchColor } from '@/lib/variantSwatchColors'

type FilterVariantGroupFieldProps = {
  group: CatalogVariantGroupFilter
  selectedValueIds: number[]
  isOpen: boolean
  onToggle: () => void
  onChange: (valueIds: number[]) => void
  onToggleValue: (valueId: number) => void
}

export function FilterVariantGroupField({
  group,
  selectedValueIds,
  isOpen,
  onToggle,
  onChange,
  onToggleValue,
}: FilterVariantGroupFieldProps) {
  const useDropdown = !group.isVisual && group.values.length > 8

  if (useDropdown) {
    return (
      <FilterMultiSelectField
        label={group.label}
        values={selectedValueIds.map(String)}
        placeholder={`All ${group.label}`}
        options={group.values.map((value) => ({
          value: String(value.id),
          label: value.label,
        }))}
        isOpen={isOpen}
        onToggle={onToggle}
        onChange={(values) => onChange(values.map(Number).filter(Number.isFinite))}
        searchPlaceholder={`Search ${group.label.toLowerCase()}...`}
      />
    )
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {group.label}
      </p>

      {group.isVisual ? (
        <div className="flex flex-wrap gap-3">
          {group.values.map((value) => {
            const isSelected = selectedValueIds.includes(value.id)
            const swatchColor = getVariantSwatchColor(value.label)

            return (
              <button
                key={value.id}
                type="button"
                onClick={() => onToggleValue(value.id)}
                aria-pressed={isSelected}
                aria-label={value.label}
                title={value.label}
                className={`flex flex-col items-center gap-1.5 transition-transform ${
                  isSelected ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <span
                  className={`h-9 w-9 rounded-full border-2 ${
                    isSelected
                      ? 'border-primary shadow-[0_0_0_2px_rgba(212,175,55,0.25)]'
                      : 'border-border'
                  }`}
                  style={{
                    backgroundColor: swatchColor ?? '#2a2a2a',
                  }}
                />
                <span
                  className={`max-w-[4.5rem] truncate text-[10px] ${
                    isSelected ? 'font-medium text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {value.label}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {group.values.map((value) => {
            const isSelected = selectedValueIds.includes(value.id)

            return (
              <button
                key={value.id}
                type="button"
                onClick={() => onToggleValue(value.id)}
                aria-pressed={isSelected}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-white'
                }`}
              >
                {value.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
