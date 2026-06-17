'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Trash2, Send } from 'lucide-react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { useCart } from '@/context/CartContext'
import { getImageUrl, getProductMainImage } from '@/lib/utils'
import { formatProductAttributesDetails } from '@/lib/productAttributes'
import {
  formatVariantEnquiryDetails,
  formatVariantLabel,
  getCartItemKey,
} from '@/lib/productVariants'
import type { Product } from '@/payload-types'

type ItemToRemove = {
  product: Product
  variantId?: string | null
}

export default function CartPage() {
  const { items: cartItems, removeItem: removeFromCart, clearCart } = useCart()
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const [itemToRemove, setItemToRemove] = useState<ItemToRemove | null>(null)

  const handleConfirmRemove = () => {
    if (!itemToRemove) return
    removeFromCart(itemToRemove.product.id, itemToRemove.variantId)
    setItemToRemove(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to an API
    // For now, we can format a WhatsApp message as an example, or just clear and show success
    const productList = cartItems
      .map((item) => {
        const attributeDetails = formatProductAttributesDetails(item.product)
        const lines = [`- ${item.product.title} (Qty: ${item.quantity})`]
        if (attributeDetails) {
          lines.push(`  ${attributeDetails.replace(/\n/g, '\n  ')}`)
        }
        if (item.variant) {
          lines.push(`  ${formatVariantEnquiryDetails(item.variant).replace(/\n/g, '\n  ')}`)
        }
        return lines.join('\n')
      })
      .join('\n')
    const waText = encodeURIComponent(
      `Hello! I have an enquiry for the following items:\n\n${productList}\n\nName: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`,
    )

    // Open whatsapp
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
    window.open(`https://wa.me/${whatsappNumber}?text=${waText}`, '_blank')
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
      {/* Header */}
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
        {/* Selected Items */}
        <section>
          <h2 className="text-sm font-medium text-primary mb-4 px-1">Selected Pieces</h2>
          <div className="bg-card rounded-3xl p-2 shadow-lg border border-border divide-y divide-border">
            {cartItems.map((item) => (
              <div
                key={getCartItemKey(item.product.id, item.variant?.id)}
                className="flex gap-4 p-4 relative group"
              >
                <div className="w-24 h-24 bg-muted rounded-2xl flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-border">
                  {getProductMainImage(item.product) ? (
                    <Image
                      src={getImageUrl(getProductMainImage(item.product))}
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

        {/* Enquiry Form */}
        <section>
          <h2 className="text-sm font-medium text-primary mb-4 px-1">Client Details</h2>
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-3xl p-6 shadow-lg border border-primary/20 space-y-5"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2"
              >
                Additional Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full bg-muted border border-border rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none placeholder:text-muted-foreground"
                placeholder="Any specific requests or questions?"
              />
            </div>

            <div className="pt-6 border-t border-primary/10">
              <button
                type="submit"
                className="w-full bg-whatsapp text-white rounded-xl py-4 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
              >
                <span>Send via WhatsApp</span>
                <WhatsAppIcon className="w-5 h-5" />
              </button>
              <p className="text-center text-[11px] text-muted-foreground mt-4 tracking-wide">
                By submitting this enquiry, you agree to be contacted via WhatsApp by our concierge.
              </p>
            </div>
          </form>
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
