'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SelectProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
  /** Include a placeholder row that clears to empty string */
  allowEmpty?: boolean
  emptyValue?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function useControllableOpen(
  openProp: boolean | undefined,
  onOpenChangeProp: ((open: boolean) => void) | undefined,
) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChangeProp?.(next)
  }

  return [open, setOpen] as const
}

export function Select({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  label,
  disabled = false,
  className = '',
  allowEmpty = false,
  emptyValue = '',
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const listboxId = `${selectId}-listbox`
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useControllableOpen(openProp, onOpenChangeProp)

  const allOptions: SelectOption[] = allowEmpty
    ? [{ value: emptyValue, label: placeholder }, ...options]
    : options

  const selectedLabel =
    allOptions.find((option) => option.value === value)?.label ??
    options.find((option) => option.value === value)?.label ??
    placeholder

  const hasValue = allowEmpty ? value !== emptyValue && value !== '' : Boolean(value)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown, { passive: true })
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, setOpen])

  const handleSelect = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()}>
      {label ? (
        <label
          htmlFor={selectId}
          className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground"
        >
          {label}
        </label>
      ) : null}

      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? 'border-primary/70 bg-surface shadow-[0_0_0_1px_rgba(212,175,55,0.25)]'
            : 'border-border bg-card hover:border-primary/35 hover:bg-surface/80'
        }`}
      >
        <span className={hasValue ? 'font-medium text-white' : 'text-muted-foreground'}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ease-out ${
            open ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      <div
        className={`absolute left-0 right-0 z-50 mt-2 origin-top transition-all duration-200 ease-out ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0'
        }`}
        aria-hidden={!open}
      >
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label ?? placeholder}
          className="max-h-60 overflow-y-auto rounded-2xl border border-border/80 bg-[#0a0a0a]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl no-scrollbar"
        >
          {allOptions.map((option) => {
            const isSelected = value === option.value

            return (
              <li key={option.value || '__empty__'} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
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
          })}
        </ul>
      </div>
    </div>
  )
}
