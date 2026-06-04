'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export function HeaderCartIcon() {
  const { itemCount } = useCart()

  return (
    <Link
      href="/cart"
      className="relative rounded-full p-2 text-[#D4AF37] hover:text-white transition-colors"
      aria-label="View Inquiry Cart"
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#111111] border border-[#D4AF37] text-[9px] font-bold text-[#D4AF37] shadow-lg">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
