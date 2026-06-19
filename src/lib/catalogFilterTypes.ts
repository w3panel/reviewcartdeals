export type CatalogFilterValueOption = {
  id: number
  label: string
}

export type CatalogVariantGroupFilter = {
  id: number
  label: string
  name: string
  isVisual: boolean
  values: CatalogFilterValueOption[]
}

export type CatalogFilterOptions = {
  /** Top 6 most common specification keys across published products */
  specFeatures: string[]
  variantGroups: CatalogVariantGroupFilter[]
}

export type SelectedVariantFilters = Record<number, number[]>
