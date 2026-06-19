'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useNavigationItems } from '@/context/NavigationContext'
import { getNavShellItems } from '@/lib/navShells'
import { getNavButtonClasses, isNavItemActive } from '@/components/NavItemLink'
import type { NavItem } from '@/payload-types'

function isVisibleInMobileDrawer(item: NavItem): boolean {
  return item.showOnMobile !== false
}

function getDrawerLinkClasses(isActive: boolean, styleVariant: NavItem['styleVariant']): string {
  if (isActive) {
    return 'block rounded-2xl border border-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all gold-gradient ring-1 ring-primary/40'
  }

  if (styleVariant === 'primary' || styleVariant === 'whatsapp') {
    return `block rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${getNavButtonClasses(styleVariant)}`
  }

  return 'block rounded-2xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary'
}

type DrawerNavLinkProps = {
  item: Pick<NavItem, 'label' | 'href' | 'openInNewTab' | 'styleVariant'>
  isActive: boolean
  onNavigate: () => void
}

function DrawerNavLink({ item, isActive, onNavigate }: DrawerNavLinkProps) {
  const className = getDrawerLinkClasses(isActive, item.styleVariant)

  if (item.href === '#') return null

  const external = /^https?:\/\//i.test(item.href) || item.openInNewTab

  if (external) {
    return (
      <a
        href={item.href}
        className={className}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        aria-current={isActive ? 'page' : undefined}
        onClick={onNavigate}
      >
        {item.label}
      </a>
    )
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  )
}

export function MobileMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navItems = useNavigationItems()
  const headerItems = getNavShellItems(navItems, 'header').filter(
    (item) => item.itemType !== 'megaMenu' && isVisibleInMobileDrawer(item),
  )
  const megaMenus = getNavShellItems(navItems, 'header').filter(
    (item) => item.itemType === 'megaMenu' && isVisibleInMobileDrawer(item),
  )

  const close = () => setOpen(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const menuPanel =
    open && mounted ? (
      <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl lg:hidden">
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex w-full flex-shrink-0 items-center justify-between">
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

          <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto">
            {headerItems.map((item) => (
              <DrawerNavLink
                key={item.id}
                item={item}
                isActive={isNavItemActive(pathname, item.href)}
                onNavigate={close}
              />
            ))}

            {megaMenus.flatMap((menu) =>
              (menu.children ?? []).map((child) => (
                <DrawerNavLink
                  key={child.id}
                  item={child}
                  isActive={isNavItemActive(pathname, child.href)}
                  onNavigate={close}
                />
              )),
            )}

            {headerItems.length === 0 &&
            megaMenus.every((menu) => (menu.children ?? []).length === 0) ? (
              <p className="px-2 text-sm text-muted-foreground">
                No menu items yet. Add links under Site → Nav Items in the admin panel.
              </p>
            ) : null}
          </nav>
        </div>
      </div>
    ) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-colors ${
          open
            ? 'border border-primary bg-primary/10 text-primary'
            : 'text-primary hover:bg-surface'
        }`}
      >
        <Menu className="h-6 w-6" />
      </button>

      {menuPanel && mounted ? createPortal(menuPanel, document.body) : null}
    </>
  )
}
