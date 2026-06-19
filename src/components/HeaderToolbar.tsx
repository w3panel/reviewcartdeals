'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import type { NavItem } from '@/payload-types'
import { useFilterSheet } from '@/context/FilterSheetContext'
import { HeaderSearch } from '@/components/HeaderSearch'
import { MobileMenu } from '@/components/MobileMenu'
import Link from 'next/link'

type HeaderToolbarProps = {
  navItems: NavItem[]
}

export function HeaderToolbar({ navItems: _navItems }: HeaderToolbarProps) {
  const pathname = usePathname()
  const { openFilter } = useFilterSheet()
  const isHome = pathname === '/'
  const isSearch = pathname === '/search'
  const showFilterSheet = isHome || isSearch

  return (
    <div className="flex items-center gap-2 px-4 pb-3 pt-3 lg:hidden">
      <MobileMenu />

      <HeaderSearch variant="mobile" className="min-w-0 flex-1" />

      {showFilterSheet ? (
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
