'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Category } from '@/payload-types'

const FilterSheet = dynamic(() =>
  import('@/components/FilterSheet').then((mod) => ({ default: mod.FilterSheet })),
)

type HomeFilterHostProps = {
  categories: Category[]
  brands: string[]
  initialTotalDocs: number
}

interface CatalogResponse {
  docs: unknown[]
  totalDocs: number
}

export function HomeFilterHost({ categories, brands, initialTotalDocs }: HomeFilterHostProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [totalDocs, setTotalDocs] = useState(initialTotalDocs)

  useEffect(() => {
    const fetchCount = async () => {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','))

      try {
        const res = await fetch(`/api/products/catalog?${params.toString()}`)
        if (res.ok) {
          const data = (await res.json()) as CatalogResponse
          setTotalDocs(data.totalDocs || 0)
        }
      } catch (err) {
        console.error('Failed to fetch filter count', err)
      }
    }

    fetchCount()
  }, [selectedCategory, selectedBrands])

  const toggleBrand = (brandTitle: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandTitle) ? prev.filter((b) => b !== brandTitle) : [...prev, brandTitle],
    )
  }

  const handleClearAll = () => {
    setSelectedCategory(null)
    setSelectedBrands([])
  }

  return (
    <FilterSheet
      categories={categories}
      brands={brands}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedBrands={selectedBrands}
      setSelectedBrands={setSelectedBrands}
      toggleBrand={toggleBrand}
      handleClearAll={handleClearAll}
      totalDocs={totalDocs}
    />
  )
}
