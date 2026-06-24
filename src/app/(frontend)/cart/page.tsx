'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, Send } from 'lucide-react'
import { SafeImage } from '@/components/SafeImage'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { useCart } from '@/context/CartContext'
import { getImageUrl, getProductMainImage } from '@/lib/utils'
import { getWhatsAppUrl } from '@/lib/siteConfig'
import {
  formatVariantEnquiryDetails,
  formatVariantLabel,
  getCartItemKey,
} from '@/lib/productVariants'
import type { DisplayProduct } from '@/lib/clientStorage'
import type { Product } from '@/payload-types'

type ItemToRemove = {
  product: DisplayProduct
  variantId?: string | null
}

export default function CartPage() {
  const { items: cartItems, removeItem: removeFromCart, clearCart } = useCart()
  const [itemToRemove, setItemToRemove] = useState<ItemToRemove | null>(null)

  const handleConfirmRemove = () => {
    if (!itemToRemove) return
    removeFromCart(itemToRemove.product.id, itemToRemove.variantId)
    setItemToRemove(null)
  }

  const handleSendWhatsApp = () => {
    const productList = cartItems
      .map((item) => {
        const lines = [`- ${item.product.title} (Qty: ${item.quantity})`]
        if (item.variant) {
          const variantDetails = formatVariantEnquiryDetails(item.variant)
          if (variantDetails) {
            lines.push(`  ${variantDetails.replace(/\n/g, '\n  ')}`)
          }
        }
        return lines.join('\n')
      })
      .join('\n')
    const message = `Hello! I have an enquiry for the following items:\n\n${productList}`
    const whatsappUrl = getWhatsAppUrl(message)
    if (!whatsappUrl) return

    window.open(whatsappUrl, '_blank')
    clearCart()
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-card border border-primary/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Send className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif text-2xl text-primary mb-2 sm:text-3xl">Your Enquiry is Empty</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-sm text-sm">
          Browse our exclusive collections and add items you&apos;re interested in to send us an
          enquiry.
        </p>
        <Link
          href="/"
          className="bg-primary text-background px-8 py-3.5 rounded-full font-bold uppercase tracking-wide hover:bg-primary-hover transition-colors shadow-lg text-sm"
        >
          Explore Collections
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-primary/20 px-4 h-16 flex items-center">
        <Link href="/" className="p-2 -ml-2 text-primary hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-serif text-lg text-white ml-2 sm:text-xl">Your Enquiry</h1>
        <div className="ml-auto bg-primary text-background text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {cartItems.length} items
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-8 mt-4">
        <section>
          <h2 className="text-sm font-medium text-primary mb-4 px-1">Selected Pieces</h2>
          <div className="bg-card rounded-3xl p-2 shadow-lg border border-border divide-y divide-border">
            {cartItems.map((item) => (
              <div
                key={getCartItemKey(item.product.id, item.variant?.id)}
                className="flex gap-4 p-4 relative group"
              >
                <div className="w-24 h-24 bg-muted rounded-2xl flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-border">
                  {getProductMainImage(item.product as Product) ? (
                    <SafeImage
                      src={getImageUrl(getProductMainImage(item.product as Product), 'thumbnail')}
                      alt={item.product.title}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full bg-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="text-sm md:text-base font-sans font-medium text-foreground leading-tight pr-8 group-hover:text-primary transition-colors">
                    {item.product.title}
                  </h3>
                  {item.variant && (
                    <p className="text-xs text-primary mt-2 leading-relaxed">
                      {formatVariantLabel(item.variant)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {item.product.description}
                  </p>
                  <p className="text-xs font-bold text-primary mt-3 uppercase tracking-wider">
                    Qty: {item.quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setItemToRemove({
                      product: item.product,
                      variantId: item.variant?.id != null ? String(item.variant.id) : null,
                    })
                  }
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 bg-muted hover:bg-red-500/10 rounded-full transition-colors border border-transparent hover:border-red-500/30"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-whatsapp bg-transparent py-4 text-sm font-bold uppercase tracking-wide text-whatsapp transition-colors hover:bg-whatsapp/10 active:scale-[0.98]"
          >
            <span>Send via WhatsApp</span>
            <WhatsAppIcon className="h-5 w-5" />
          </button>
        </section>
      </main>

      {itemToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setItemToRemove(null)}
            aria-label="Cancel removal"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-item-title"
            className="relative bg-card w-full max-w-sm rounded-3xl p-6 shadow-xl border border-border"
          >
            <h2 id="remove-item-title" className="text-lg font-sans font-bold text-foreground">
              Remove from enquiry?
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              &ldquo;{itemToRemove.product.title}&rdquo; will be removed from your enquiry list.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wide bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
