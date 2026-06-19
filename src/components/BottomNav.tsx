'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Circle, Home } from 'lucide-react'
import type { NavItem } from '@/payload-types'
import { CartCountBadge, isCartNavItem } from '@/components/CartCountBadge'
import { useNavigationItems, useNavigationShell } from '@/context/NavigationContext'
import { useCart } from '@/context/CartContext'
import { isBottomNavItemActive } from '@/lib/bottomNavActive'
import { getBottomNavShellClasses } from '@/lib/navVisibility'
import { getNavIcon } from '@/lib/navIcons'
import { NavItemLink } from '@/components/NavItemLink'

function isVisibleOnMobile(item: NavItem): boolean {
  return item.showOnMobile !== false
}

function BottomNavItem({
  item,
  pathname,
  itemCount,
}: {
  item: NavItem
  pathname: string
  itemCount: number
}) {
  const Icon = getNavIcon(item.icon) ?? (item.href === '/' ? Home : Circle)
  const isActive = isBottomNavItemActive(pathname, item)
  const showCartCount = isCartNavItem(item)
  const itemClassName =
    `flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-2 transition-colors ${
      isActive ? 'text-primary' : 'text-white/45'
    }`.trim()

  const icon = (
    <>
      <span className="relative inline-flex">
        <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={isActive ? 2 : 1.5} />
        {showCartCount ? <CartCountBadge count={itemCount} /> : null}
      </span>
      <span
        className={`max-w-full truncate text-[10px] leading-tight ${
          isActive ? 'font-semibold' : 'font-normal'
        }`}
      >
        {item.label}
      </span>
    </>
  )

  const ariaLabel =
    showCartCount && itemCount > 0 ? `${item.label}, ${itemCount} items` : item.label

  if (/^https?:\/\//i.test(item.href) || item.openInNewTab) {
    return (
      <NavItemLink key={item.id} item={item} className={itemClassName}>
        {icon}
      </NavItemLink>
    )
  }

  return (
    <Link key={item.id} href={item.href} className={itemClassName} aria-label={ariaLabel}>
      {icon}
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const allItems = useNavigationItems()
  const items = useNavigationShell('bottom')
    .filter(isVisibleOnMobile)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const shellClasses = getBottomNavShellClasses(allItems)

  if (items.length === 0) return null

  return (
    <nav
      className={`fixed bottom-0 left-0 z-50 flex h-16 w-full border-t border-white/10 bg-black pb-safe lg:hidden ${shellClasses}`}
      aria-label="Mobile navigation"
    >
      <div className="flex h-full w-full items-stretch px-1">
        {items.map((item) => (
          <BottomNavItem key={item.id} item={item} pathname={pathname} itemCount={itemCount} />
        ))}
      </div>
    </nav>
  )
}
