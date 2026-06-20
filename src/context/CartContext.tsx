'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { Product, ProductVariant } from '@/payload-types'
import { getCartItemKey } from '@/lib/productVariants'
import {
  CART_STORAGE_KEY,
  migrateLegacyCart,
  toDisplayProduct,
  toDisplayVariant,
  toStoredProductSummary,
  toStoredVariantSummary,
  type DisplayProduct,
  type DisplayVariant,
  type StoredCartItem,
} from '@/lib/clientStorage'

type CartItem = {
  product: DisplayProduct
  variant?: DisplayVariant | null
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (
    product: Product | DisplayProduct,
    variant?: ProductVariant | DisplayVariant | null,
  ) => void
  removeItem: (productId: string | number, variantId?: string | null) => void
  updateQuantity: (productId: string | number, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const LEGACY_CART_STORAGE_KEY = 'reviewcartdeals_cart'

function hydrateCartItems(stored: StoredCartItem[]): CartItem[] {
  return stored.map((item) => ({
    product: toDisplayProduct(item.product),
    variant: toDisplayVariant(item.variant),
    quantity: item.quantity,
  }))
}

function serializeCartItems(items: CartItem[]): StoredCartItem[] {
  return items.map((item) => ({
    product: toStoredProductSummary(item.product as Product),
    variant: toStoredVariantSummary(item.variant),
    quantity: item.quantity,
  }))
}

function loadStoredCart(): StoredCartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as unknown
      if (Array.isArray(parsed)) {
        return parsed as StoredCartItem[]
      }
    }

    const legacy = localStorage.getItem(LEGACY_CART_STORAGE_KEY)
    if (legacy) {
      const migrated = migrateLegacyCart(JSON.parse(legacy))
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
      return migrated
    }
  } catch (e) {
    console.error('Failed to load cart', e)
  }

  return []
}

function normalizeProduct(product: Product | DisplayProduct): DisplayProduct {
  return 'category' in product
    ? toDisplayProduct(toStoredProductSummary(product as Product))
    : product
}

function normalizeVariant(
  variant: ProductVariant | DisplayVariant | null | undefined,
): DisplayVariant | null {
  if (!variant) return null
  return 'product' in variant
    ? toDisplayVariant(toStoredVariantSummary(variant as ProductVariant))
    : variant
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => hydrateCartItems(loadStoredCart()))
  const hydratedRef = useRef(false)

  useEffect(() => {
    hydratedRef.current = true
  }, [])

  useEffect(() => {
    if (!hydratedRef.current) return

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializeCartItems(items)))
    } catch (e) {
      console.error('Failed to save cart', e)
    }
  }, [items])

  const addItem = (
    product: Product | DisplayProduct,
    variant?: ProductVariant | DisplayVariant | null,
  ) => {
    const displayProduct = normalizeProduct(product)
    const displayVariant = normalizeVariant(variant)
    const itemKey = getCartItemKey(displayProduct.id, displayVariant?.id)

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
      return [...prev, { product: displayProduct, variant: displayVariant, quantity: 1 }]
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
