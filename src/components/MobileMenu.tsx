'use client'
// src/components/MobileMenu.tsx
// Premium responsive mobile navigation menu for ReviewCartDeals
// This component matches the dark‑gold aesthetic used throughout the site.

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { Category } from '@/payload-types'

interface MobileMenuProps {
  /** Array of categories fetched from the Payload CMS */
  categories: Category[]
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ categories }) => {
  const [open, setOpen] = useState(false)

  const toggleMenu = () => setOpen(!open)

  return (
    <div className="relative md:hidden">
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex items-center gap-2 rounded p-2 text-primary hover:text-foreground transition-colors"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        <span className="sr-only">Menu</span>
      </button>

      {/* Slide‑over panel */}
      <div
        className={`fixed inset-0 z-40 bg-background/98 backdrop-blur-xl transition-transform duration-300 border-r border-border ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-6">
          {/* Close button at top */}
          <div className="flex justify-between items-center w-full mb-8">
            <span className="font-sans text-xl font-bold tracking-tight text-foreground">Menu</span>
            <button
              onClick={toggleMenu}
              aria-label="Close menu"
              className="rounded p-2 text-primary hover:text-foreground transition-colors bg-card border border-border"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Category list */}
          <nav className="space-y-4 overflow-y-auto">
            <Link
              href="/search"
              className="block rounded-xl px-5 py-3 text-sm font-semibold text-background bg-primary hover:bg-primary-hover transition-colors"
              onClick={toggleMenu}
            >
              All Categories
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="block rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-card hover:text-primary border border-transparent hover:border-border transition-all"
                onClick={toggleMenu}
              >
                {cat.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
