'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Circle } from 'lucide-react'
import type { NavItem } from '@/payload-types'
import { useNavigationItems, useNavigationShell } from '@/context/NavigationContext'
import { isBottomNavItemActive } from '@/lib/bottomNavActive'
import { getNavIcon } from '@/lib/navIcons'
import { getNavVisibilityClasses, getBottomNavShellClasses } from '@/lib/navVisibility'
import { NavItemLink } from '@/components/NavItemLink'

function renderBottomNavItem(item: NavItem, pathname: string) {
  const Icon = getNavIcon(item.icon) ?? Circle
  const isActive = isBottomNavItemActive(pathname, item)
  const visibility = getNavVisibilityClasses(item)
  const itemClassName =
    `flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ${visibility} ${
      isActive ? 'text-primary' : 'text-white/45'
    }`.trim()
  const icon = (
    <>
      <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2 : 1.5} />
      <span
        className={`truncate text-[10px] leading-tight ${
          isActive ? 'font-semibold' : 'font-normal'
        }`}
      >
        {item.label}
      </span>
    </>
  )

  if (/^https?:\/\//i.test(item.href) || item.openInNewTab) {
    return (
      <NavItemLink key={item.id} item={item} className={itemClassName}>
        {icon}
      </NavItemLink>
    )
  }

  return (
    <Link key={item.id} href={item.href} className={itemClassName}>
      {icon}
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const allItems = useNavigationItems()
  const items = useNavigationShell('bottom').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const shellClasses = getBottomNavShellClasses(allItems)

  if (items.length === 0) return null

  return (
    <nav
      className={`fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black pb-safe ${shellClasses}`}
      aria-label="Mobile navigation"
    >
      <div
        className="grid h-16 items-stretch px-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => renderBottomNavItem(item, pathname))}
      </div>
    </nav>
  )
}
