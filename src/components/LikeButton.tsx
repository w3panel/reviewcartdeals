'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { useLiked } from '@/context/LikedContext'
import type { Product } from '@/payload-types'

interface LikeButtonProps {
  product: Product
  className?: string
  variant?: 'default' | 'overlay'
}

export function LikeButton({ product, className = '', variant = 'default' }: LikeButtonProps) {
  const { isLiked, toggleLike } = useLiked()

  const liked = isLiked(product.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleLike(product)
  }

  const iconClass =
    variant === 'overlay'
      ? liked
        ? 'fill-primary text-primary scale-110'
        : 'text-white/90 group-hover:text-primary group-hover:scale-110'
      : liked
        ? 'fill-primary text-primary scale-110'
        : 'text-primary/70 group-hover:text-primary group-hover:scale-110'

  return (
    <button
      onClick={handleToggle}
      className={`relative rounded-full p-2 transition-all group ${className}`}
      aria-label={liked ? 'Remove from liked' : 'Add to liked'}
    >
      <Heart className={`h-4 w-4 transition-all sm:h-5 sm:w-5 ${iconClass}`} />
    </button>
  )
}
