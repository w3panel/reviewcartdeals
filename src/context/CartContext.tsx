'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@/payload-types'

type CartItem = {
  product: Product
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string | number) => void
  updateQuantity: (productId: string | number, quantity: number) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('reviewcartdeals_cart')
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load cart', e)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('reviewcartdeals_cart', JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart', e)
    }
  }, [items])

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeItem = (productId: string | number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string | number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
