'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import type { CatalogFilterOptions } from '@/lib/catalogFilterTypes'
import {
  appendCatalogFiltersToParams,
  buildSearchPath,
  type CatalogFilterSnapshot,
  toggleVariantValue,
} from '@/lib/catalogFilterParams'
import type { Category } from '@/payload-types'

type FilterActiveChipsProps = {
  categories: Category[]
  filterOptions: CatalogFilterOptions
  applied: CatalogFilterSnapshot
}

export function FilterActiveChips({ categories, filterOptions, applied }: FilterActiveChipsProps) {
  const categoryLabelBySlug = useMemo(
    () =>
      Object.fromEntries(
        categories
          .filter((category) => category.slug)
          .map((category) => [category.slug as string, category.title]),
      ),
    [categories],
  )

  const variantLabelById = useMemo(() => {
    const map = new Map<number, string>()
    for (const group of filterOptions.variantGroups) {
      for (const value of group.values) {
        map.set(value.id, `${group.label}: ${value.label}`)
      }
    }
    return map
  }, [filterOptions.variantGroups])

  const chips: { key: string; label: string; href: string }[] = []

  if (applied.q.trim()) {
    const next = { ...applied, q: '' }
    chips.push({
      key: 'q',
      label: `"${applied.q.trim()}"`,
      href: buildSearchPath(
        appendCatalogFiltersToParams(new URLSearchParams(), {
          q: next.q,
          categories: next.categories,
          brands: next.brands,
          specs: next.specs,
          variants: next.variants,
        }),
      ),
    })
  }

  for (const slug of applied.categories) {
    const next = { ...applied, categories: applied.categories.filter((entry) => entry !== slug) }
    chips.push({
      key: `cat-${slug}`,
      label: categoryLabelBySlug[slug] ?? slug,
      href: buildSearchPath(
        appendCatalogFiltersToParams(new URLSearchParams(), {
          q: next.q,
          categories: next.categories,
          brands: next.brands,
          specs: next.specs,
          variants: next.variants,
        }),
      ),
    })
  }

  for (const brand of applied.brands) {
    const next = { ...applied, brands: applied.brands.filter((entry) => entry !== brand) }
    chips.push({
      key: `brand-${brand}`,
      label: brand,
      href: buildSearchPath(
        appendCatalogFiltersToParams(new URLSearchParams(), {
          q: next.q,
          categories: next.categories,
          brands: next.brands,
          specs: next.specs,
          variants: next.variants,
        }),
      ),
    })
  }

  for (const spec of applied.specs) {
    const next = { ...applied, specs: applied.specs.filter((entry) => entry !== spec) }
    chips.push({
      key: `spec-${spec}`,
      label: spec,
      href: buildSearchPath(
        appendCatalogFiltersToParams(new URLSearchParams(), {
          q: next.q,
          categories: next.categories,
          brands: next.brands,
          specs: next.specs,
          variants: next.variants,
        }),
      ),
    })
  }

  for (const [groupId, valueIds] of Object.entries(applied.variants)) {
    for (const valueId of valueIds) {
      const nextVariants = toggleVariantValue(applied.variants, Number(groupId), valueId)
      const next = { ...applied, variants: nextVariants }
      chips.push({
        key: `variant-${groupId}-${valueId}`,
        label: variantLabelById.get(valueId) ?? String(valueId),
        href: buildSearchPath(
          appendCatalogFiltersToParams(new URLSearchParams(), {
            q: next.q,
            categories: next.categories,
            brands: next.brands,
            specs: next.specs,
            variants: next.variants,
          }),
        ),
      })
    }
  }

  if (chips.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          {chip.label} ×
        </Link>
      ))}
      <Link
        href="/search"
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
      >
        Clear all
      </Link>
    </div>
  )
}
