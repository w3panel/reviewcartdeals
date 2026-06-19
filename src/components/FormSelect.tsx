'use client'

import React, { useState } from 'react'
import { Select, type SelectOption } from '@/components/Select'

type FormSelectProps = {
  name: string
  defaultValue?: string
  options: SelectOption[]
  placeholder?: string
  label?: string
  className?: string
  emptyValue?: string
}

export function FormSelect({
  name,
  defaultValue = '',
  options,
  placeholder = 'Select…',
  label,
  className,
  emptyValue = 'ALL',
}: FormSelectProps) {
  const [value, setValue] = useState(defaultValue || emptyValue)

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value}
        onChange={setValue}
        options={options}
        placeholder={placeholder}
        label={label}
        className={className}
        allowEmpty
        emptyValue={emptyValue}
      />
    </>
  )
}
