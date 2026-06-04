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
      className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 text-xs font-bold tracking-widest uppercase text-black transition-all duration-300 rounded-xl bg-[#D4AF37] hover:bg-[#C5A059] shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)]"
    >
      <ShoppingCart className="w-4 h-4" />
      Enquire Now
    </button>
  )
}
