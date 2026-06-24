'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart } from 'lucide-react'
import { useLiked } from '@/context/LikedContext'
import type { Product } from '@/payload-types'
import { ProductCard } from '@/components/ProductCard'
import { ProductCardGrid } from '@/components/ProductCardGrid'

export default function LikedPage() {
  const { likedItems, removeLike } = useLiked()

  if (likedItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mb-6">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif text-2xl text-white mb-2 sm:text-3xl">No Saved Items</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-sm text-sm">
          Browse our collections and tap the heart icon to save pieces you love.
        </p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold text-sm hover:bg-primary-hover transition-colors"
        >
          Explore Collections
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border px-4 h-14 flex items-center">
        <Link href="/" className="p-2 -ml-2 text-primary">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-serif text-lg text-white ml-2 sm:text-xl">Saved Items</h1>
        <div className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          {likedItems.length}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ProductCardGrid>
          {likedItems.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product as Product} />
              <button
                type="button"
                onClick={() => removeLike(product.id)}
                className="absolute right-2 top-2 z-10 rounded-full border border-primary/30 bg-black/70 p-2 text-primary backdrop-blur-sm transition-colors hover:bg-black"
                aria-label="Remove from saved"
              >
                <Heart className="h-4 w-4 fill-primary" />
              </button>
            </div>
          ))}
        </ProductCardGrid>
      </main>
    </div>
  )
}
