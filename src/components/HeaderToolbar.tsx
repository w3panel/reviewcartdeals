'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { NavItem } from '@/payload-types'
import { useFilterSheet } from '@/context/FilterSheetContext'
import { MobileMenu } from '@/components/MobileMenu'

type HeaderToolbarProps = {
  navItems: NavItem[]
}

export function HeaderToolbar({ navItems: _navItems }: HeaderToolbarProps) {
  const pathname = usePathname()
  const { openFilter } = useFilterSheet()
  const isHome = pathname === '/'

  return (
    <div className="flex items-center gap-2 px-4 pb-3 pt-3 lg:hidden">
      <MobileMenu />

      <Link
        href="/search"
        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
      >
        <span className="truncate text-sm text-muted-foreground">
          Search watches, wallets, bags...
        </span>
        <Search className="h-4 w-4 flex-shrink-0 text-primary" />
      </Link>

      {isHome ? (
        <button
          type="button"
          onClick={openFilter}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-primary bg-black text-primary transition-colors hover:bg-primary/10"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      ) : (
        <Link
          href="/search"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-primary bg-black text-primary transition-colors hover:bg-primary/10"
          aria-label="Browse catalog"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
