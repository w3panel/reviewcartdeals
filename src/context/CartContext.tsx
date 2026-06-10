'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@/payload-types'
import { getCartItemKey, type ProductVariant } from '@/lib/productVariants'

type CartItem = {
  product: Product
  variant?: ProductVariant | null
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant | null) => void
  removeItem: (productId: string | number, variantId?: string | null) => void
  updateQuantity: (productId: string | number, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

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

  useEffect(() => {
    try {
      localStorage.setItem('reviewcartdeals_cart', JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart', e)
    }
  }, [items])

  const addItem = (product: Product, variant?: ProductVariant | null) => {
    const itemKey = getCartItemKey(product.id, variant?.id)

    setItems((prev) => {
      const existing = prev.find(
        (item) => getCartItemKey(item.product.id, item.variant?.id) === itemKey,
      )
      if (existing) {
        return prev.map((item) =>
          getCartItemKey(item.product.id, item.variant?.id) === itemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...prev, { product, variant: variant ?? null, quantity: 1 }]
    })
  }

  const removeItem = (productId: string | number, variantId?: string | null) => {
    const itemKey = getCartItemKey(productId, variantId)
    setItems((prev) =>
      prev.filter((item) => getCartItemKey(item.product.id, item.variant?.id) !== itemKey),
    )
  }

  const updateQuantity = (
    productId: string | number,
    quantity: number,
    variantId?: string | null,
  ) => {
    const itemKey = getCartItemKey(productId, variantId)
    setItems((prev) =>
      prev.map((item) =>
        getCartItemKey(item.product.id, item.variant?.id) === itemKey
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount }}
    >
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
