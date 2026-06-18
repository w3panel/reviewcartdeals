export async function fetchPublishedOptionValueIdsForType(typeId: number): Promise<number[]> {
  const docs = await fetchPublishedOptionValuesForType(typeId)
  return docs.map((doc) => doc.id)
}

const publishedOptionValuesCache = new Map<string, Array<{ id: number; value: string }>>()
const publishedOptionValuesInFlight = new Map<
  string,
  Promise<Array<{ id: number; value: string }>>
>()
const variantOptionValueLabelsCache = new Map<string, Record<number, string>>()
const variantTypesCache = new Map<
  string,
  Array<{ id: number; label: string; isPrimaryVisualType?: boolean | null }>
>()
const mediaThumbnailCache = new Map<number, string | null>()

function buildIdsCacheKey(ids: number[]): string {
  return [...ids].sort((left, right) => left - right).join(',')
}

async function loadPublishedOptionValuesForType(
  typeId: number,
  cacheKey: string,
): Promise<Array<{ id: number; value: string }>> {
  try {
    const params = new URLSearchParams({
      depth: '0',
      limit: '250',
    })
    params.append('where[and][0][variantType][equals]', String(typeId))
    params.append('where[and][1][_status][equals]', 'published')

    const response = await fetch(`/api/variant-option-values?${params.toString()}`, {
      credentials: 'include',
    })

    if (!response.ok) return []

    const json = (await response.json()) as { docs?: Array<{ id: number; value?: string }> }
    const docs = (json.docs ?? []).map((doc) => ({
      id: doc.id,
      value: doc.value?.trim() || String(doc.id),
    }))
    publishedOptionValuesCache.set(cacheKey, docs)
    return docs
  } finally {
    publishedOptionValuesInFlight.delete(cacheKey)
  }
}

export async function fetchPublishedOptionValuesForType(
  typeId: number,
): Promise<Array<{ id: number; value: string }>> {
  const cacheKey = String(typeId)
  const cached = publishedOptionValuesCache.get(cacheKey)
  if (cached) return cached

  const inFlight = publishedOptionValuesInFlight.get(cacheKey)
  if (inFlight) return inFlight

  const request = loadPublishedOptionValuesForType(typeId, cacheKey)
  publishedOptionValuesInFlight.set(cacheKey, request)
  return request
}

export async function fetchVariantOptionValueLabels(
  optionValueIds: number[],
): Promise<Record<number, string>> {
  if (optionValueIds.length === 0) return {}

  const cacheKey = buildIdsCacheKey(optionValueIds)
  const cached = variantOptionValueLabelsCache.get(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    depth: '0',
    limit: String(optionValueIds.length),
  })
  optionValueIds.forEach((optionValueId, index) => {
    params.append(`where[and][0][id][in][${index}]`, String(optionValueId))
  })

  const response = await fetch(`/api/variant-option-values?${params.toString()}`, {
    credentials: 'include',
  })

  if (!response.ok) return {}

  const json = (await response.json()) as { docs?: Array<{ id: number; value?: string }> }
  const labels: Record<number, string> = {}
  for (const doc of json.docs ?? []) {
    labels[doc.id] = doc.value?.trim() || String(doc.id)
  }

  variantOptionValueLabelsCache.set(cacheKey, labels)
  return labels
}

export async function fetchPublishedOptionValueLabelsForTypes(
  typeIds: number[],
): Promise<Record<number, string>> {
  if (typeIds.length === 0) return {}

  const labelSets = await Promise.all(
    typeIds.map(async (typeId) => {
      const docs = await fetchPublishedOptionValuesForType(typeId)
      const labels: Record<number, string> = {}
      for (const doc of docs) {
        labels[doc.id] = doc.value
      }
      return labels
    }),
  )

  return Object.assign({}, ...labelSets)
}

export async function fetchVariantTypesByIds(
  typeIds: number[],
): Promise<Array<{ id: number; label: string; isPrimaryVisualType?: boolean | null }>> {
  if (typeIds.length === 0) return []

  const cacheKey = buildIdsCacheKey(typeIds)
  const cached = variantTypesCache.get(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    depth: '0',
    limit: String(typeIds.length),
  })
  typeIds.forEach((typeId, index) => {
    params.append(`where[and][0][id][in][${index}]`, String(typeId))
  })

  const response = await fetch(`/api/variant-types?${params.toString()}`, {
    credentials: 'include',
  })

  if (!response.ok) return []

  const json = (await response.json()) as {
    docs?: Array<{
      id: number
      label?: string
      name?: string
      isPrimaryVisualType?: boolean | null
    }>
  }

  const types = (json.docs ?? []).map((doc) => ({
    id: doc.id,
    label: doc.label?.trim() || doc.name?.trim() || `Type ${doc.id}`,
    isPrimaryVisualType: doc.isPrimaryVisualType,
  }))
  variantTypesCache.set(cacheKey, types)
  return types
}

export async function fetchMediaThumbnailUrl(mediaId: number): Promise<string | null> {
  if (mediaThumbnailCache.has(mediaId)) {
    return mediaThumbnailCache.get(mediaId) ?? null
  }

  const response = await fetch(`/api/media/${mediaId}?depth=0`, {
    credentials: 'include',
  })

  if (!response.ok) {
    mediaThumbnailCache.set(mediaId, null)
    return null
  }

  const json = (await response.json()) as { url?: string; thumbnailURL?: string }
  const url = json.thumbnailURL ?? json.url ?? null
  mediaThumbnailCache.set(mediaId, url)
  return url
}

export async function fetchVariantTypeLabels(typeIds: number[]): Promise<Record<number, string>> {
  const types = await fetchVariantTypesByIds(typeIds)
  const labels: Record<number, string> = {}
  for (const type of types) {
    labels[type.id] = type.label
  }
  return labels
}
