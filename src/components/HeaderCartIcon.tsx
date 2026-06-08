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
      className="relative p-2 text-foreground hover:text-primary transition-colors flex items-center justify-center"
      aria-label="View Cart"
    >
      <ShoppingCart className="h-6 w-6" strokeWidth={2} />
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
