'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Trash2, Send } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { getImageUrl } from '@/lib/utils'

export default function CartPage() {
  const { items: cartItems, removeItem: removeFromCart, clearCart } = useCart()
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to an API
    // For now, we can format a WhatsApp message as an example, or just clear and show success
    const productList = cartItems.map((item) => `- ${item.product.title} (Qty: ${item.quantity})`).join('\n')
    const waText = encodeURIComponent(
      `Hello! I have an enquiry for the following items:\n\n${productList}\n\nName: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`
    )
    
    // Open whatsapp
    window.open(`https://wa.me/1234567890?text=${waText}`, '_blank')
    clearCart()
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#050505] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-[#111111] border border-[#D4AF37]/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Send className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#D4AF37] mb-2 tracking-wide">Your Enquiry is Empty</h1>
        <p className="text-gray-400 text-center mb-8 max-w-sm text-sm">
          Browse our exclusive collections and add items you're interested in to send us an enquiry.
        </p>
        <Link
          href="/"
          className="bg-[#D4AF37] text-black px-8 py-3.5 rounded-full font-bold uppercase tracking-wider hover:bg-[#C5A059] transition-colors shadow-lg text-sm"
        >
          Explore Collections
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 h-16 flex items-center">
        <Link href="/" className="p-2 -ml-2 text-[#D4AF37] hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-serif font-bold text-[#D4AF37] ml-2 tracking-widest uppercase">Your Enquiry</h1>
        <div className="ml-auto bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {cartItems.length} items
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-8 mt-4">
        {/* Selected Items */}
        <section>
          <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4 px-1">Selected Pieces</h2>
          <div className="bg-[#111111] rounded-3xl p-2 shadow-lg border border-[#D4AF37]/20 divide-y divide-[#D4AF37]/10">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex gap-4 p-4 relative group">
                <div className="w-24 h-24 bg-[#1A1A1A] rounded-2xl flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-gray-800">
                  {item.product.image ? (
                    <Image
                      src={getImageUrl(item.product.image)}
                      alt={item.product.title}
                      fill
                      className="object-contain p-2"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#111111]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="text-sm md:text-base font-serif font-bold text-white leading-tight pr-8 group-hover:text-[#D4AF37] transition-colors">
                    {item.product.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.product.shortDescription}
                  </p>
                  <p className="text-xs font-bold text-[#D4AF37] mt-3 uppercase tracking-wider">
                    Qty: {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 bg-[#1A1A1A] hover:bg-red-500/10 rounded-full transition-colors border border-transparent hover:border-red-500/30"
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
          <h2 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4 px-1">Client Details</h2>
          <form onSubmit={handleSubmit} className="bg-[#111111] rounded-3xl p-6 shadow-lg border border-[#D4AF37]/20 space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all placeholder:text-gray-600"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all placeholder:text-gray-600"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Additional Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all resize-none placeholder:text-gray-600"
                placeholder="Any specific requests or questions?"
              />
            </div>

            <div className="pt-6 border-t border-[#D4AF37]/10">
              <button
                type="submit"
                className="w-full bg-[#D4AF37] text-black rounded-xl py-4 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#C5A059] active:scale-[0.98] transition-all shadow-lg"
              >
                <span>Send via WhatsApp</span>
                <Send className="w-5 h-5" />
              </button>
              <p className="text-center text-[11px] text-gray-500 mt-4 tracking-wide">
                By submitting this enquiry, you agree to be contacted via WhatsApp by our concierge.
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
