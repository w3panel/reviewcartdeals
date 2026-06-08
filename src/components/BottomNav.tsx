'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Heart, ShoppingCart } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', href: '/', icon: Home, match: (p: string) => p === '/' },
    { label: 'Browse', href: '/search', icon: LayoutGrid, match: (p: string) => p.startsWith('/search') || p.startsWith('/category') },
    { label: 'Saved', href: '/liked', icon: Heart, match: (p: string) => p.startsWith('/liked') },
    { label: 'Enquiry', href: '/cart', icon: ShoppingCart, match: (p: string) => p.startsWith('/cart') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border md:hidden flex justify-around items-center px-2 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.match(pathname)
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className={`p-1.5 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
