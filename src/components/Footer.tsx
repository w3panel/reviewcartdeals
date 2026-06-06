import React from 'react'
import Link from 'next/link'
import { getCategories } from '@/services/categories'
import { MessageCircle, Shield, Award, Clock } from 'lucide-react'
import type { Category } from '@/payload-types'

export async function Footer() {
  const categories = await getCategories()

  return (
    <footer className="border-t border-luxury-gray bg-[#040404] text-gray-400">
      {/* Luxury Brand Trust Section */}
      <div className="border-b border-luxury-gray bg-luxury-black py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Award className="h-6 w-6 text-luxury-gold" />
              <h4 className="text-sm font-semibold tracking-wider text-white">CURATED LUXURY</h4>
              <p className="text-xs text-gray-500">Only the finest watches, leather goods, and designer accessories.</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <Shield className="h-6 w-6 text-luxury-gold" />
              <h4 className="text-sm font-semibold tracking-wider text-white">SECURE INQUIRY</h4>
              <p className="text-xs text-gray-500">Discuss pricing, details, and delivery privately on WhatsApp.</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <Clock className="h-6 w-6 text-luxury-gold" />
              <h4 className="text-sm font-semibold tracking-wider text-white">24/7 SUPPORT</h4>
              <p className="text-xs text-gray-500">Our concierge support team is ready to answer your enquiries.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Column 1: Info */}
          <div className="md:col-span-2">
            <span className="font-serif text-2xl font-bold tracking-widest text-white">
              Review<span className="gold-text-gradient">Cart</span>Deals
            </span>
            <p className="mt-4 text-sm max-w-md text-gray-500 leading-relaxed">
              Discover a highly curated catalog of exquisite timepieces, designer bags, handcrafted wallets, sunglasses, and custom accessories. We connect discerning buyers directly with personal assistants on WhatsApp for ultimate service.
            </p>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-white border-b border-luxury-gray pb-2">
              CATEGORIES
            </h5>
            <ul className="mt-4 space-y-2 text-sm">
              {categories.map((cat: Category) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-luxury-gold transition-colors"
                  >
                    {cat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-white border-b border-luxury-gray pb-2">
              PLATFORM
            </h5>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-luxury-gold transition-colors">
                  Home Catalog
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-luxury-gold transition-colors">
                  Search Catalog
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-luxury-gold transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  Concierge Chat
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-luxury-gray pt-6 text-center text-xs text-gray-600">
          <p>© {new Date().getFullYear()} ReviewCartDeals Luxury Showcase. All rights reserved. Built using Next.js & Payload CMS.</p>
        </div>
      </div>
    </footer>
  )
}
