'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { hasVariants, type ProductVariant } from '@/lib/productVariants'
import type { Product } from '@/payload-types'

type AddToCartButtonProps = {
  product: Product
  variant?: ProductVariant | null
  disabled?: boolean
}

export function AddToCartButton({
  product,
  variant = null,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const productHasVariants = hasVariants(product)

  if (productHasVariants && !variant) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="flex flex-1 items-center justify-center w-full gap-2 px-4 py-3 text-xs font-bold text-primary-foreground uppercase tracking-widest bg-primary transition-colors duration-300 rounded-lg hover:bg-primary-hover"
      >
        Select Options
      </Link>
    )
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product, variant)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      className="flex flex-1 items-center justify-center w-full gap-2 px-4 py-3 text-xs font-bold text-primary-foreground uppercase tracking-widest bg-primary transition-colors duration-300 rounded-lg hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Enquiry
    </button>
  )
}
