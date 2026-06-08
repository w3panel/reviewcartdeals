'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/payload-types'

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="flex flex-1 items-center justify-center w-full gap-2 px-4 py-3 text-xs font-bold text-primary-foreground uppercase tracking-widest bg-primary transition-colors duration-300 rounded-lg hover:bg-primary-hover"
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Enquiry
    </button>
  )
}
