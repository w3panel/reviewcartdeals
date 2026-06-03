'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface Media {
  id: string
  url?: string
  alt: string
}

interface ProductGalleryProps {
  gallery: Media[]
}

export function ProductGallery({ gallery }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!gallery || gallery.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-lg bg-black flex items-center justify-center border border-luxury-gray">
        <span className="text-gray-500">No Image Available</span>
      </div>
    )
  }

  const activeImage = gallery[activeIndex]

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black border border-luxury-gray flex items-center justify-center p-4">
        <Image
          src={activeImage.url || '/placeholder.jpg'}
          alt={activeImage.alt || 'Product Image'}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 transition-all duration-500 hover:scale-105"
        />
      </div>

      {/* Thumbnails strip (Only render if there is more than 1 image) */}
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gallery.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded border bg-black transition-all ${
                idx === activeIndex
                  ? 'border-luxury-gold ring-1 ring-luxury-gold'
                  : 'border-luxury-gray hover:border-gray-400'
              }`}
            >
              <Image
                src={img.url || '/placeholder.jpg'}
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
