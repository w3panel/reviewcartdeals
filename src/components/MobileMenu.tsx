'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useNavigationItems } from '@/context/NavigationContext'
import { getNavShellItems } from '@/lib/navShells'
import { getNavVisibilityClasses } from '@/lib/navVisibility'

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const navItems = useNavigationItems()
  const headerItems = getNavShellItems(navItems, 'header').filter(
    (item) => item.itemType !== 'megaMenu',
  )
  const megaMenus = getNavShellItems(navItems, 'header').filter(
    (item) => item.itemType === 'megaMenu',
  )

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-primary transition-colors hover:bg-surface"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl lg:hidden">
          <div className="flex h-full flex-col p-6">
            <div className="mb-8 flex w-full items-center justify-between">
              <span className="font-serif text-2xl text-white">Menu</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="rounded-full border border-border bg-surface p-2 text-primary transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-3 overflow-y-auto">
              {headerItems.map((item) => {
                const visibility = getNavVisibilityClasses(item, 'block')
                if (item.href === '#') return null
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${visibility} rounded-2xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary`}
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                )
              })}

              {megaMenus.flatMap((menu) =>
                (menu.children ?? []).map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    className="block rounded-2xl border border-transparent px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:bg-surface hover:text-primary"
                    onClick={close}
                  >
                    {child.label}
                  </Link>
                )),
              )}

              <Link
                href="/search"
                className="block rounded-2xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors gold-gradient"
                onClick={close}
              >
                Browse Catalog
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
