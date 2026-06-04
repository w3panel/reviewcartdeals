import React from 'react'
import Link from 'next/link'
import { getCategories } from '@/services/categories'
import { Search, ShoppingCart } from 'lucide-react'
import { MobileMenu } from './MobileMenu'
import type { Category } from '@/payload-types'
import { HeaderCartIcon } from './HeaderCartIcon'

export async function Header() {
  const categories = await getCategories()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D4AF37]/20 bg-[#0A0A0A]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu toggle & Logo */}
        <div className="flex items-center gap-4">
          <MobileMenu categories={categories} />
          
          <Link href="/" className="flex items-center">
            <span className="font-serif text-xl md:text-2xl font-bold tracking-widest uppercase text-[#D4AF37] flex items-center gap-2">
              ReviewCart <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-10 text-xs font-bold tracking-[0.2em] uppercase text-white">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors relative group">
            HOME
            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full"></span>
          </Link>
          
          <div className="relative group flex items-center">
            <span className="cursor-pointer hover:text-[#D4AF37] transition-colors relative">
              COLLECTIONS
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full"></span>
            </span>
            {/* Dropdown menu */}
            <div className="absolute left-0 top-full mt-4 hidden w-64 rounded-2xl border border-[#D4AF37]/20 bg-[#111111] p-2 shadow-2xl group-hover:block">
              {categories.map((cat: Category) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="block rounded-xl px-5 py-3 text-xs text-gray-300 hover:bg-[#1A1A1A] hover:text-[#D4AF37] transition-all font-semibold tracking-wider"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
          
          <Link href="/search" className="hover:text-[#D4AF37] transition-colors relative group">
            DESIGNERS
            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <HeaderCartIcon />
        </div>
      </div>
    </header>
  )
}
