'use client'

import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useLiked } from '@/context/LikedContext'

export function HeaderLikedIcon() {
  const { likedCount } = useLiked()

  return (
    <Link
      href="/liked"
      className="relative rounded-full p-2 text-primary hover:text-primary-hover transition-colors"
      aria-label="View Liked Products"
    >
      <Heart className="h-6 w-6" />
      {likedCount > 0 && (
        <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-foreground shadow-lg">
          {likedCount}
        </span>
      )}
    </Link>
  )
}
