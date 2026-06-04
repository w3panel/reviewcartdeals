import React from 'react'
import Link from 'next/link'
import { getCategories } from '@/services/categories'
import { ShoppingCart } from 'lucide-react'
import { MobileMenu } from './MobileMenu'
import type { Category } from '@/payload-types'
import { HeaderCartIcon } from './HeaderCartIcon'
import { ThemeToggle } from './ThemeToggle'

export async function Header() {
  const categories = await getCategories()

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border/10">
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu toggle & Logo */}
        <div className="flex items-center gap-4">
          <MobileMenu categories={categories} />
          
          <Link href="/" className="flex items-center">
            <span className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              ReviewCart <ShoppingCart className="w-6 h-6 text-primary" />
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-10 text-sm font-medium text-foreground">
          <Link href="/" className="hover:text-primary transition-colors relative group">
            Home
          </Link>
          
          <div className="relative group flex items-center">
            <span className="cursor-pointer hover:text-primary transition-colors relative">
              Categories
            </span>
            {/* Dropdown menu */}
            <div className="absolute left-0 top-full mt-4 hidden w-64 rounded-2xl border border-primary/20 bg-card p-2 shadow-2xl group-hover:block z-50">
              {categories.map((cat: Category) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="block rounded-xl px-5 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-primary transition-all font-medium"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
          
          <Link href="/search" className="hover:text-primary transition-colors relative group">
            Deals
          </Link>
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <HeaderCartIcon />
        </div>
      </div>
    </header>
  )
}
