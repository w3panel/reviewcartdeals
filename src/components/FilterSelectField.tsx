'use client'

import React from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type FilterSelectOption = {
  value: string
  label: string
}

type FilterSelectFieldProps = {
  label: string
  value: string | null
  placeholder: string
  options: FilterSelectOption[]
  isOpen: boolean
  onToggle: () => void
  onChange: (value: string | null) => void
}

export function FilterSelectField({
  label,
  value,
  placeholder,
  options,
  isOpen,
  onToggle,
  onChange,
}: FilterSelectFieldProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder
  const allOptions: FilterSelectOption[] = [{ value: '', label: placeholder }, ...options]

  const handleSelect = (nextValue: string) => {
    onChange(nextValue || null)
    onToggle()
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
          isOpen ? 'border-primary bg-surface' : 'border-border bg-card hover:border-primary/35'
        }`}
      >
        <span className={value ? 'font-medium text-white' : 'text-muted-foreground'}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div className="mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          <ul className="max-h-52 overflow-y-auto no-scrollbar" role="listbox">
            {allOptions.map((option, index) => {
              const isSelected = (value ?? '') === option.value
              const isLast = index === allOptions.length - 1

              return (
                <li key={option.value || '__all__'} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                      !isLast ? 'border-b border-border/60' : ''
                    } ${
                      isSelected
                        ? 'bg-primary/10 text-white'
                        : 'text-muted-foreground hover:bg-surface hover:text-white'
                    }`}
                  >
                    <span className={isSelected ? 'font-medium' : undefined}>{option.label}</span>
                    {isSelected ? (
                      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-border/80" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
