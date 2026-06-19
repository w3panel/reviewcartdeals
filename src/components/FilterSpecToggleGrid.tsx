'use client'

import React from 'react'

type FilterSpecToggleGridProps = {
  label?: string
  features: string[]
  selected: string[]
  onToggle: (feature: string) => void
}

export function FilterSpecToggleGrid({
  label = 'Features',
  features,
  selected,
  onToggle,
}: FilterSpecToggleGridProps) {
  if (features.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {features.map((feature) => {
          const isSelected = selected.includes(feature)

          return (
            <button
              key={feature}
              type="button"
              onClick={() => onToggle(feature)}
              aria-pressed={isSelected}
              className={`rounded-xl border px-3 py-3 text-left text-xs font-medium leading-snug transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-white'
              }`}
            >
              {feature}
            </button>
          )
        })}
      </div>
    </div>
  )
}
