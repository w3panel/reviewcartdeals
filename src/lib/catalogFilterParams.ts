import type { SelectedVariantFilters } from '@/lib/catalogFilterTypes'

export function parseListParam(param: string | null | undefined): string[] {
  if (!param) return []
  return param
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function parseVariantsParam(param: string | null | undefined): SelectedVariantFilters {
  if (!param) return {}

  const result: SelectedVariantFilters = {}

  for (const groupPart of param.split(';')) {
    const colonIndex = groupPart.indexOf(':')
    if (colonIndex === -1) continue

    const groupId = Number(groupPart.slice(0, colonIndex))
    const valuesStr = groupPart.slice(colonIndex + 1)
    if (!Number.isFinite(groupId) || !valuesStr) continue

    const valueIds = valuesStr
      .split(',')
      .map((entry) => Number(entry.trim()))
      .filter((id) => Number.isFinite(id))

    if (valueIds.length > 0) {
      result[groupId] = valueIds
    }
  }

  return result
}

export function serializeVariantsParam(selected: SelectedVariantFilters): string {
  return Object.entries(selected)
    .filter(([, valueIds]) => valueIds.length > 0)
    .sort(([groupA], [groupB]) => Number(groupA) - Number(groupB))
    .map(([groupId, valueIds]) => `${groupId}:${valueIds.join(',')}`)
    .join(';')
}

export function countSelectedVariants(selected: SelectedVariantFilters): number {
  return Object.values(selected).reduce((total, valueIds) => total + valueIds.length, 0)
}

export function toggleVariantValue(
  selected: SelectedVariantFilters,
  groupId: number,
  valueId: number,
): SelectedVariantFilters {
  const current = selected[groupId] ?? []
  const next = current.includes(valueId)
    ? current.filter((id) => id !== valueId)
    : [...current, valueId]

  if (next.length === 0) {
    const { [groupId]: _removed, ...rest } = selected
    return rest
  }

  return { ...selected, [groupId]: next }
}

export function appendCatalogFiltersToParams(
  params: URLSearchParams,
  options: {
    q?: string
    categories?: string[]
    brands?: string[]
    specs?: string[]
    variants?: SelectedVariantFilters
    sort?: string
    page?: string | number
  },
): URLSearchParams {
  if (options.q?.trim()) params.set('q', options.q.trim())

  if (options.categories?.length) {
    params.set('category', options.categories.join(','))
  } else {
    params.delete('category')
  }

  if (options.brands?.length) {
    params.set('brand', options.brands.join(','))
  } else {
    params.delete('brand')
  }

  if (options.specs?.length) {
    params.set('spec', options.specs.join(','))
  } else {
    params.delete('spec')
  }

  const variantsParam = serializeVariantsParam(options.variants ?? {})
  if (variantsParam) {
    params.set('variants', variantsParam)
  } else {
    params.delete('variants')
  }

  if (options.sort && options.sort !== 'popular') {
    params.set('sort', options.sort)
  } else {
    params.delete('sort')
  }

  if (options.page !== undefined && String(options.page) !== '1') {
    params.set('page', String(options.page))
  } else {
    params.delete('page')
  }

  return params
}

export function hasActiveCatalogFilters(options: {
  q?: string
  categories?: string[]
  brands?: string[]
  specs?: string[]
  variants?: SelectedVariantFilters
}): boolean {
  return Boolean(
    options.q?.trim() ||
    (options.categories?.length ?? 0) > 0 ||
    (options.brands?.length ?? 0) > 0 ||
    (options.specs?.length ?? 0) > 0 ||
    countSelectedVariants(options.variants ?? {}) > 0,
  )
}

export type CatalogFilterSnapshot = {
  q: string
  categories: string[]
  brands: string[]
  specs: string[]
  variants: SelectedVariantFilters
}

export function buildSearchPath(params: URLSearchParams): string {
  const query = params.toString()
  return query ? `/search?${query}` : '/search'
}

export function buildSearchPathFromSnapshot(snapshot: CatalogFilterSnapshot, page = 1): string {
  const params = appendCatalogFiltersToParams(new URLSearchParams(), {
    q: snapshot.q,
    categories: snapshot.categories,
    brands: snapshot.brands,
    specs: snapshot.specs,
    variants: snapshot.variants,
    page,
  })
  return buildSearchPath(params)
}

export function snapshotFromSearchParams(searchParams: URLSearchParams): CatalogFilterSnapshot {
  return {
    q: searchParams.get('q') || '',
    categories: parseListParam(searchParams.get('category')),
    brands: parseListParam(searchParams.get('brand')),
    specs: parseListParam(searchParams.get('spec')),
    variants: parseVariantsParam(searchParams.get('variants')),
  }
}

/** Parse filters from `searchParams.toString()` without depending on a live URLSearchParams reference. */
export function snapshotFromSearchParamsKey(searchParamsKey: string): CatalogFilterSnapshot {
  return snapshotFromSearchParams(new URLSearchParams(searchParamsKey))
}
