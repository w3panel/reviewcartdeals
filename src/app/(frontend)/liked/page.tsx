'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Heart } from 'lucide-react'
import { useLiked } from '@/context/LikedContext'
import type { Product } from '@/payload-types'
import { getImageUrl, getProductMainImage } from '@/lib/utils'
import { AddToCartButton } from '@/components/AddToCartButton'
import type { Brand } from '@/payload-types'

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

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {likedItems.map((prod) => (
            <div
              key={prod.id}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-3 sm:p-4"
            >
              <button
                type="button"
                onClick={() => removeLike(prod.id)}
                className="absolute top-2 right-2 z-10 p-2 rounded-full text-primary"
                aria-label="Remove from saved"
              >
                <Heart className="w-5 h-5 fill-primary" />
              </button>
              <Link href={`/product/${prod.slug}`} className="flex-grow flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-background">
                  <Image
                    src={getImageUrl(getProductMainImage(prod as Product), 'card')}
                    alt={prod.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 320px"
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-[10px] font-bold text-primary uppercase tracking-wider">
                  {typeof prod.brand === 'object' && prod.brand !== null
                    ? (prod.brand as Brand).title
                    : String(prod.brand)}
                </p>
                <h4 className="mt-1 text-sm font-medium text-foreground line-clamp-2">
                  {prod.title}
                </h4>
              </Link>
              <div className="mt-3 pt-3 border-t border-border">
                <AddToCartButton product={prod} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
