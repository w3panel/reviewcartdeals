'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Heart } from 'lucide-react'
import { useLiked } from '@/context/LikedContext'
import { getImageUrl } from '@/lib/utils'
import { AddToCartButton } from '@/components/AddToCartButton'
import type { Brand } from '@/payload-types'

export default function LikedPage() {
  const { likedItems, removeLike } = useLiked()

  if (likedItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-luxury-black flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-[#0c0c0c] border border-luxury-gray/40 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Heart className="w-8 h-8 text-luxury-gold" />
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-widest text-white uppercase mb-2">No Liked Pieces</h1>
        <p className="text-gray-500 text-center mb-8 max-w-sm text-sm">
          Browse our exclusive collections and tap the heart icon to save pieces you love.
        </p>
        <Link
          href="/"
          className="bg-luxury-gold text-luxury-black px-8 py-3.5 rounded font-bold uppercase tracking-wide hover:bg-luxury-gold-hover transition-colors shadow-lg text-xs"
        >
          Explore Collections
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-black pb-24 text-gray-200">
      <header className="sticky top-0 z-20 bg-luxury-black/90 backdrop-blur-md border-b border-luxury-gray/40 px-4 h-16 flex items-center">
        <Link href="/" className="p-2 -ml-2 text-luxury-gold hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-serif text-lg font-bold tracking-widest text-white uppercase ml-2">Liked Pieces</h1>
        <div className="ml-auto bg-luxury-gold text-luxury-black text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
          {likedItems.length} items
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {likedItems.map((prod) => {
            const imageUrl = getImageUrl(prod.image)
            return (
              <div
                key={prod.id}
                className="group relative flex flex-col rounded border border-luxury-gray bg-[#0c0c0c] p-4 hover-gold-glow transition-all duration-300"
              >
                <button
                  onClick={() => removeLike(prod.id)}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full transition-all text-luxury-gold hover:bg-luxury-gray/40"
                  aria-label="Remove from liked"
                >
                  <Heart className="w-5 h-5 fill-luxury-gold text-luxury-gold" />
                </button>
                <Link href={`/product/${prod.slug}`} className="flex-grow flex flex-col">
                  <div className="relative aspect-square w-full overflow-hidden rounded bg-black flex items-center justify-center">
                    <Image
                      src={imageUrl}
                      alt={prod.title}
                      width={200}
                      height={200}
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-xs font-semibold tracking-widest text-luxury-gold uppercase">
                    {typeof prod.brand === 'object' && prod.brand !== null
                      ? (prod.brand as Brand).title
                      : String(prod.brand)}
                  </h3>
                  <h4 className="mt-1 text-sm font-medium text-white line-clamp-1 group-hover:text-luxury-gold transition-colors">
                    {prod.title}
                  </h4>
                </Link>
                <div className="mt-4 border-t border-luxury-gray/40 pt-4 flex flex-col gap-2">
                   <AddToCartButton product={prod} />
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
