import React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getCategories } from '@/services/categories'
import type { Category } from '@/payload-types'
import { HeaderCartIcon } from './HeaderCartIcon'

const MobileMenu = dynamic(() => import('./MobileMenu'))

export async function Header() {
  const categories = await getCategories()

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="mx-auto flex h-14 sm:h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center flex-1 md:flex-none">
          <MobileMenu categories={categories} />

          <nav className="hidden md:flex ml-8 space-x-8 text-sm font-medium text-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <div className="relative group flex items-center">
              <span className="cursor-pointer hover:text-primary transition-colors">
                Categories
              </span>
              <div className="absolute left-0 top-full mt-2 hidden w-56 rounded-xl border border-border bg-card p-2 shadow-xl group-hover:block z-50">
                {categories.map((cat: Category) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-primary transition-all"
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/search" className="hover:text-primary transition-colors">
              Browse
            </Link>
          </nav>
        </div>

        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="font-sans text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Review<span className="text-primary">Cart</span>
          </span>
        </Link>

        <div className="flex items-center justify-end flex-1 md:flex-none">
          <HeaderCartIcon />
        </div>
      </div>
    </header>
  )
}
