'use client'

import React, { useEffect, useId, useMemo, useRef } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import type { SelectOption } from '@/components/Select'

type FilterMultiSelectFieldProps = {
  label: string
  values: string[]
  placeholder: string
  options: SelectOption[]
  isOpen: boolean
  onToggle: () => void
  onChange: (values: string[]) => void
  searchPlaceholder?: string
}

function formatSummary(values: string[], options: SelectOption[], placeholder: string): string {
  if (values.length === 0) return placeholder
  if (values.length === 1) {
    return options.find((option) => option.value === values[0])?.label ?? values[0]
  }
  return `${values.length} selected`
}

export function FilterMultiSelectField({
  label,
  values,
  placeholder,
  options,
  isOpen,
  onToggle,
  onChange,
  searchPlaceholder = 'Search…',
}: FilterMultiSelectFieldProps) {
  const fieldId = useId()
  const listboxId = `${fieldId}-listbox`
  const containerRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = React.useState('')

  useEffect(() => {
    if (!isOpen) setSearch('')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      onToggle()
    }

    document.addEventListener('mousedown', handlePointerDown, { passive: true })
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen, onToggle])

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) => option.label.toLowerCase().includes(query))
  }, [options, search])

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((entry) => entry !== value))
      return
    }
    onChange([...values, value])
  }

  const summary = formatSummary(values, options, placeholder)

  return (
    <div ref={containerRef}>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>

      <button
        id={fieldId}
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-all duration-200 ease-out ${
          isOpen
            ? 'border-primary/70 bg-surface shadow-[0_0_0_1px_rgba(212,175,55,0.25)]'
            : 'border-border bg-card hover:border-primary/35 hover:bg-surface/80'
        }`}
      >
        <span className={values.length > 0 ? 'font-medium text-white' : 'text-muted-foreground'}>
          {summary}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ease-out ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen ? (
        <div className="mt-2 overflow-hidden rounded-2xl border border-border/80 bg-[#0a0a0a]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="border-b border-border/80 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            className="max-h-52 overflow-y-auto p-1.5 no-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">No matches found.</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values.includes(option.value)

                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => toggleValue(option.value)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition-colors duration-150 ${
                        isSelected
                          ? 'bg-primary/15 text-white'
                          : 'text-muted-foreground hover:bg-surface hover:text-white'
                      }`}
                    >
                      <span className={isSelected ? 'font-medium' : undefined}>{option.label}</span>
                      {isSelected ? (
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="h-4 w-4 flex-shrink-0 rounded-full border border-border/80" />
                      )}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
