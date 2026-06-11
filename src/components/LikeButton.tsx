'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { useLiked } from '@/context/LikedContext'
import type { Product } from '@/payload-types'

interface LikeButtonProps {
  product: Product
  className?: string
}

export function LikeButton({ product, className = '' }: LikeButtonProps) {
  const { isLiked, toggleLike } = useLiked()

  const liked = isLiked(product.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleLike(product)
  }

  return (
    <button
      onClick={handleToggle}
      className={`relative p-2 rounded-full transition-all group ${className}`}
      aria-label={liked ? 'Remove from liked' : 'Add to liked'}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          liked
            ? 'fill-primary text-primary scale-110'
            : 'text-primary/70 group-hover:text-primary group-hover:scale-110'
        }`}
      />
    </button>
  )
}
