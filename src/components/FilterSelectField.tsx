'use client'

import React from 'react'
import { Select, type SelectOption } from '@/components/Select'

export type FilterSelectOption = SelectOption

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
  return (
    <Select
      label={label}
      value={value ?? ''}
      onChange={(next) => onChange(next || null)}
      options={options}
      placeholder={placeholder}
      allowEmpty
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen !== isOpen) onToggle()
      }}
    />
  )
}
