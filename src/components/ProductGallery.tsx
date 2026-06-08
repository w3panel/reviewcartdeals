'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import type { Media } from '@/payload-types'

interface ProductGalleryProps {
  images: Media[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const validImages = (images ?? []).filter(
    (img): img is Media => img != null && typeof img === 'object' && 'id' in img,
  )

  const [activeIndex, setActiveIndex] = useState(0)

  if (validImages.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-2xl bg-background flex items-center justify-center border border-border">
        <span className="text-muted-foreground text-sm">No image available</span>
      </div>
    )
  }

  const safeIndex = activeIndex < validImages.length ? activeIndex : 0
  const activeImage = validImages[safeIndex]

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-background border border-border flex items-center justify-center p-4 sm:p-6">
        <Image
          src={getImageUrl(activeImage)}
          alt={activeImage.alt || title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain transition-transform duration-300"
        />
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
          {validImages.map((img, idx) => (
            <button
              key={img.id ?? `gallery-thumb-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-card transition-all ${
                idx === safeIndex
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Image
                src={getImageUrl(img)}
                alt={img.alt || 'Thumbnail'}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
