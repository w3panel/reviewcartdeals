'use client'

import React from 'react'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { CartCountBadge } from '@/components/CartCountBadge'
import { useCart } from '@/context/CartContext'

export function HeaderCartIcon() {
  const { itemCount } = useCart()

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center p-2 text-foreground transition-colors hover:text-primary"
      aria-label={itemCount > 0 ? `View cart, ${itemCount} items` : 'View cart'}
    >
      <span className="relative inline-flex">
        <ClipboardList className="h-6 w-6" strokeWidth={2} />
        <CartCountBadge count={itemCount} />
      </span>
    </Link>
  )
}
