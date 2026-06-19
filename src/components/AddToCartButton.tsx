'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import type { Product, ProductVariant } from '@/payload-types'

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
  const router = useRouter()
  const { addItem } = useCart()

  const handleAddToEnquiry = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return

    addItem(product, variant ?? null)
    router.push('/cart')
  }

  return (
    <button
      type="button"
      onClick={handleAddToEnquiry}
      disabled={disabled}
      className="flex flex-1 items-center justify-center w-full gap-2 px-4 py-3 text-xs font-bold text-primary-foreground uppercase tracking-widest bg-primary transition-colors duration-300 rounded-lg hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ClipboardList className="w-4 h-4" />
      Add to Enquiry
    </button>
  )
}
