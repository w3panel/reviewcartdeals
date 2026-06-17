export async function fetchPublishedOptionValueIdsForType(typeId: number): Promise<number[]> {
  const docs = await fetchPublishedOptionValuesForType(typeId)
  return docs.map((doc) => doc.id)
}

export async function fetchPublishedOptionValuesForType(
  typeId: number,
): Promise<Array<{ id: number; value: string }>> {
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
  return (json.docs ?? []).map((doc) => ({
    id: doc.id,
    value: doc.value?.trim() || String(doc.id),
  }))
}

export async function fetchVariantOptionValueLabels(
  optionValueIds: number[],
): Promise<Record<number, string>> {
  if (optionValueIds.length === 0) return {}

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

export async function fetchVariantTypeLabels(typeIds: number[]): Promise<Record<number, string>> {
  if (typeIds.length === 0) return {}

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

  if (!response.ok) return {}

  const json = (await response.json()) as {
    docs?: Array<{ id: number; label?: string; name?: string }>
  }

  const labels: Record<number, string> = {}
  for (const doc of json.docs ?? []) {
    labels[doc.id] = doc.name?.trim() || doc.label?.trim() || `Type ${doc.id}`
  }

  return labels
}
