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
      className="flex flex-1 items-center justify-center w-full gap-2 px-4 py-3.5 text-xs font-bold text-black uppercase tracking-widest bg-[#F5B82A] transition-colors duration-300 rounded-lg hover:bg-[#d49e21]"
    >
      <ShoppingCart className="w-4 h-4" />
      ADD TO ENQUIRY
    </button>
  )
}
