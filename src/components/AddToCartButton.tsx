'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/payload-types'

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating if inside a link
    addItem(product)
  }

  return (
    <button
      onClick={handleAdd}
      className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-4 text-xs font-semibold text-primary transition-colors duration-300 rounded-xl bg-transparent border border-primary hover:bg-primary/10"
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Enquiry
    </button>
  )
}
