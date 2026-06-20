export type CatalogSort = 'popular' | 'newest' | 'rating'

export type CatalogUrlParams = {
  q?: string
  category?: string | null
  brand?: string | string[] | null
  sort?: CatalogSort
  page?: number
}

const SORT_LABELS: Record<CatalogSort, string> = {
  popular: 'Popular',
  newest: 'Newest',
  rating: 'Rating',
}

const LABEL_TO_SORT: Record<string, CatalogSort> = {
  Popular: 'popular',
  Newest: 'newest',
  Rating: 'rating',
}

export function parseCatalogSort(value: string | null | undefined): CatalogSort {
  if (value === 'popular' || value === 'newest' || value === 'rating') {
    return value
  }
  return 'popular'
}

export function catalogSortToLabel(sort: CatalogSort): string {
  return SORT_LABELS[sort]
}

export function labelToCatalogSort(label: string): CatalogSort {
  return LABEL_TO_SORT[label] ?? 'popular'
}

export function buildCatalogSearchUrl(params: CatalogUrlParams = {}): string {
  const search = new URLSearchParams()

  const q = params.q?.trim()
  if (q) search.set('q', q)

  if (params.category) search.set('category', params.category)

  const brands = Array.isArray(params.brand)
    ? params.brand.filter(Boolean)
    : params.brand
      ? [params.brand]
      : []
  if (brands.length > 0) search.set('brand', brands.join(','))

  const sort = params.sort ?? 'popular'
  if (sort !== 'popular') search.set('sort', sort)

  if (params.page && params.page > 1) search.set('page', String(params.page))

  const qs = search.toString()
  return qs ? `/search?${qs}` : '/search'
}

export function buildCatalogApiParams(params: {
  q?: string
  category?: string
  brand?: string
  sort?: CatalogSort
  page?: string | number
}): URLSearchParams {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.category && params.category !== 'ALL') search.set('category', params.category)
  if (params.brand && params.brand !== 'ALL') search.set('brand', params.brand)
  if (params.sort && params.sort !== 'popular') search.set('sort', params.sort)
  const page = Number(params.page) || 1
  if (page > 1) search.set('page', String(page))
  return search
}
