'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@/payload-types'
import {
  LIKED_STORAGE_KEY,
  migrateLegacyLiked,
  toDisplayProduct,
  toStoredProductSummary,
  type StoredProductSummary,
} from '@/lib/clientStorage'

type LikedContextType = {
  likedItems: Product[]
  toggleLike: (product: Product) => void
  removeLike: (productId: string | number) => void
  isLiked: (productId: string | number) => boolean
  clearLiked: () => void
  likedCount: number
}

const LikedContext = createContext<LikedContextType | undefined>(undefined)
const LEGACY_LIKED_STORAGE_KEY = 'reviewcartdeals_liked'

function hydrateLikedItems(stored: StoredProductSummary[]): Product[] {
  return stored.map((item) => toDisplayProduct(item))
}

function loadStoredLiked(): StoredProductSummary[] {
  try {
    const saved = localStorage.getItem(LIKED_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as unknown
      if (Array.isArray(parsed)) {
        return parsed as StoredProductSummary[]
      }
    }

    const legacy = localStorage.getItem(LEGACY_LIKED_STORAGE_KEY)
    if (legacy) {
      const migrated = migrateLegacyLiked(JSON.parse(legacy))
      localStorage.removeItem(LEGACY_LIKED_STORAGE_KEY)
      return migrated
    }
  } catch (e) {
    console.error('Failed to load liked items', e)
  }

  return []
}

export function LikedProvider({ children }: { children: React.ReactNode }) {
  const [likedItems, setLikedItems] = useState<Product[]>([])

  useEffect(() => {
    setLikedItems(hydrateLikedItems(loadStoredLiked()))
  }, [])

  useEffect(() => {
    try {
      const stored = likedItems.map((product) => toStoredProductSummary(product))
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(stored))
    } catch (e) {
      console.error('Failed to save liked items', e)
    }
  }, [likedItems])

  const toggleLike = (product: Product) => {
    setLikedItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.filter((item) => item.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const removeLike = (productId: string | number) => {
    setLikedItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const isLiked = (productId: string | number) => {
    return likedItems.some((item) => item.id === productId)
  }

  const clearLiked = () => setLikedItems([])

  const likedCount = likedItems.length

  return (
    <LikedContext.Provider
      value={{ likedItems, toggleLike, removeLike, isLiked, clearLiked, likedCount }}
    >
      {children}
    </LikedContext.Provider>
  )
}

export function useLiked() {
  const context = useContext(LikedContext)
  if (context === undefined) {
    throw new Error('useLiked must be used within a LikedProvider')
  }
  return context
}
