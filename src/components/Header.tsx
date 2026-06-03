import React from 'react'
import Link from 'next/link'
import { getCategories } from '@/services/categories'
import { Search, MessageCircle } from 'lucide-react'
import { MobileMenu } from './MobileMenu'
import type { Category } from '@/payload-types'

export async function Header() {
  const categories = await getCategories()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-luxury-gray bg-luxury-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu toggle & Logo */}
        <div className="flex items-center gap-4">
          <MobileMenu categories={categories} />
          
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-white">
              Review<span className="gold-text-gradient">Cart</span>Deals
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-widest">
          <Link href="/" className="text-gray-300 hover:text-luxury-gold transition-colors">
            HOME
          </Link>
          
          <div className="relative group flex items-center">
            <span className="cursor-pointer text-gray-300 group-hover:text-luxury-gold transition-colors">
              CATEGORIES
            </span>
            {/* Dropdown menu */}
            <div className="absolute left-0 top-full mt-2 hidden w-56 rounded-md border border-luxury-gray bg-luxury-black p-2 shadow-2xl group-hover:block">
              {categories.map((cat: Category) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="block rounded px-4 py-2 text-xs tracking-wider text-gray-300 hover:bg-luxury-gray hover:text-luxury-gold transition-all"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
          
          <Link href="/search" className="text-gray-300 hover:text-luxury-gold transition-colors">
            BROWSE ALL
          </Link>
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-4">
          {/* Search bar button */}
          <Link
            href="/search"
            className="rounded-full p-2 text-gray-400 hover:text-luxury-gold transition-colors"
            aria-label="Search Catalog"
          >
            <Search className="h-5 w-5" />
          </Link>

          {/* Premium WhatsApp Button */}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'}?text=${encodeURIComponent(
              'Hello,\n\nI am browsing the ReviewCartDeals Luxury Showcase. I would like to enquire about your available catalog items.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 rounded border border-luxury-gold bg-transparent px-4 py-2 text-xs font-semibold tracking-wider text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
          >
            <MessageCircle className="h-4 w-4" />
            ENQUIRE
          </a>
        </div>
      </div>
    </header>
  )
}
