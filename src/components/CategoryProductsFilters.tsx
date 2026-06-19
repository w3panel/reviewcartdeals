'use client'

import React from 'react'
import { FormSelect } from '@/components/FormSelect'

type CategoryProductsFiltersProps = {
  brands: string[]
  defaultBrand?: string
}

export function CategoryProductsFilters({
  brands,
  defaultBrand = '',
}: CategoryProductsFiltersProps) {
  return (
    <FormSelect
      name="brand"
      defaultValue={defaultBrand || 'ALL'}
      placeholder="All Brands"
      options={brands.map((brand) => ({ value: brand, label: brand }))}
      className="w-full md:w-56"
    />
  )
}
