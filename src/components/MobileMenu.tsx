'use client'
// src/components/MobileMenu.tsx

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { Category } from '@/payload-types'

interface MobileMenuProps {
  categories: Category[]
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ categories }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex items-center rounded-full p-2 text-primary transition-colors hover:bg-surface"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex w-full items-center justify-between">
            <span className="font-serif text-2xl text-white">Menu</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="rounded-full border border-border bg-surface p-2 text-primary transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-3 overflow-y-auto">
            <Link
              href="/"
              className="block rounded-2xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors gold-gradient"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/search"
              className="block rounded-2xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Browse Catalog
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="block rounded-2xl border border-transparent px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-surface hover:text-primary"
                onClick={() => setOpen(false)}
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
