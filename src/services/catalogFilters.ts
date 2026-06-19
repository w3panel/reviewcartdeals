import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cacheTags'
import type { CatalogFilterOptions, CatalogVariantGroupFilter } from '@/lib/catalogFilterTypes'
import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'
import { fetchAvailableVariantValueIds } from '@/lib/variantFilterLookups'
import { withQueryTiming } from '@/lib/observability'

const FILTER_OPTIONS_REVALIDATE_SECONDS = 300

async function fetchTopSpecFeatures(): Promise<string[]> {
  const payload = await getPayloadClient()

  try {
    const { rows } = await payload.db.pool.query<{ key: string }>(
      `SELECT ps.key
       FROM products_specifications ps
       INNER JOIN products p ON p.id = ps._parent_id
       WHERE p._status = 'published'
         AND ps.key IS NOT NULL
         AND TRIM(ps.key) <> ''
       GROUP BY ps.key
       ORDER BY COUNT(*) DESC, ps.key ASC
       LIMIT 6`,
    )

    return rows.map((row) => row.key.trim()).filter(Boolean)
  } catch {
    const response = await payload.find({
      collection: 'products',
      where: withPublishedOnly(),
      depth: 0,
      limit: 500,
      pagination: false,
      select: {
        specifications: true,
      },
    })

    const counts = new Map<string, number>()

    for (const product of response.docs) {
      for (const row of product.specifications ?? []) {
        const key = row.key?.trim()
        if (!key) continue
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([key]) => key)
  }
}

async function fetchVariantGroupFilters(): Promise<CatalogVariantGroupFilter[]> {
  const payload = await getPayloadClient()

  const [groupsResponse, valuesResponse, availableValueIds] = await Promise.all([
    payload.find({
      collection: 'variant-groups',
      where: withPublishedOnly(),
      depth: 0,
      limit: 100,
      pagination: false,
      sort: 'label',
      select: {
        label: true,
        name: true,
        isVisual: true,
      },
    }),
    payload.find({
      collection: 'variant-values',
      where: withPublishedOnly(),
      depth: 0,
      limit: 1000,
      pagination: false,
      sort: 'label',
      select: {
        label: true,
        group: true,
      },
    }),
    fetchAvailableVariantValueIds(payload),
  ])

  const valuesByGroup = new Map<number, CatalogVariantGroupFilter['values']>()

  for (const value of valuesResponse.docs) {
    const groupId = typeof value.group === 'number' ? value.group : null
    if (groupId === null || !availableValueIds.has(value.id)) continue

    const list = valuesByGroup.get(groupId) ?? []
    list.push({ id: value.id, label: value.label })
    valuesByGroup.set(groupId, list)
  }

  return groupsResponse.docs
    .map((group) => ({
      id: group.id,
      label: group.label,
      name: group.name,
      isVisual: Boolean(group.isVisual),
      values: valuesByGroup.get(group.id) ?? [],
    }))
    .filter((group) => group.values.length > 0)
}

async function fetchCatalogFilterOptions(): Promise<CatalogFilterOptions> {
  const [specFeatures, variantGroups] = await Promise.all([
    fetchTopSpecFeatures(),
    fetchVariantGroupFilters(),
  ])

  return { specFeatures, variantGroups }
}

export async function getCatalogFilterOptions(): Promise<CatalogFilterOptions> {
  return unstable_cache(
    async () => withQueryTiming('getCatalogFilterOptions', fetchCatalogFilterOptions),
    ['catalog-filter-options-v2'],
    {
      tags: [CACHE_TAGS.products, CACHE_TAGS.lookups, 'catalog-filters'],
      revalidate: FILTER_OPTIONS_REVALIDATE_SECONDS,
    },
  )()
}
