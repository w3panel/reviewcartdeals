'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { NavItem } from '@/payload-types'
import { getNavShellItems } from '@/lib/navShells'
import { getNavIcon } from '@/lib/navIcons'
import { getNavVisibilityClasses } from '@/lib/navVisibility'
import { NavItemLink, getNavButtonClasses } from '@/components/NavItemLink'
import { useFilterSheet } from '@/context/FilterSheetContext'

type HeaderToolbarProps = {
  navItems: NavItem[]
}

export function HeaderToolbar({ navItems }: HeaderToolbarProps) {
  const pathname = usePathname()
  const { openFilter } = useFilterSheet()
  const isHome = pathname === '/'
  const toolbarItems = getNavShellItems(navItems, 'toolbar')

  return (
    <div className="flex items-center gap-2 px-4 pb-3 pt-3 md:hidden">
      <Link
        href="/search"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
      >
        <Search className="h-4 w-4 flex-shrink-0 text-primary" />
        <span className="truncate text-sm text-muted-foreground">
          Search watches, wallets, bags...
        </span>
      </Link>

      {toolbarItems.map((item) => {
        const visibility = getNavVisibilityClasses(item)
        const Icon = getNavIcon(item.icon)

        if (
          item.itemType === 'button' ||
          item.styleVariant === 'whatsapp' ||
          item.styleVariant === 'iconOnly'
        ) {
          return (
            <NavItemLink
              key={item.id}
              item={item}
              icon={Icon}
              className={`${visibility} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${getNavButtonClasses(item.styleVariant, 'rounded-2xl')}`}
            />
          )
        }

        return (
          <NavItemLink
            key={item.id}
            item={item}
            className={`${visibility} flex h-12 flex-shrink-0 items-center justify-center rounded-2xl border border-primary px-3 text-xs font-semibold text-primary`}
          />
        )
      })}

      {toolbarItems.length === 0 &&
        (isHome ? (
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
        ))}
    </div>
  )
}
