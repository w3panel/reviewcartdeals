'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@/payload-types'

type LikedContextType = {
  likedItems: Product[]
  toggleLike: (product: Product) => void
  removeLike: (productId: string | number) => void
  isLiked: (productId: string | number) => boolean
  clearLiked: () => void
  likedCount: number
}

const LikedContext = createContext<LikedContextType | undefined>(undefined)

export function LikedProvider({ children }: { children: React.ReactNode }) {
  const [likedItems, setLikedItems] = useState<Product[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('reviewcartdeals_liked')
      if (saved) {
        setLikedItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load liked items', e)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('reviewcartdeals_liked', JSON.stringify(likedItems))
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
    <LikedContext.Provider value={{ likedItems, toggleLike, removeLike, isLiked, clearLiked, likedCount }}>
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
