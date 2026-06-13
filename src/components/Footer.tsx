import React from 'react'
import type { NavItem } from '@/payload-types'
import { filterNavShell } from '@/services/navigation'
import { getNavVisibilityClasses } from '@/lib/navVisibility'
import { NavItemLink } from './NavItemLink'

export async function Footer({ navItems }: { navItems: NavItem[] }) {
  const footerItems = filterNavShell(navItems, 'footer')

  return (
    <footer className="hidden border-t border-border bg-black text-muted-foreground md:block">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className={footerItems.length > 0 ? 'md:col-span-2' : 'md:col-span-4'}>
            <p className="max-w-md text-sm leading-relaxed">
              Discover a curated catalog of exquisite timepieces, designer bags, and premium
              accessories. Connect directly with our team on WhatsApp for personal assistance.
            </p>
          </div>

          {footerItems.length > 0 && (
            <div>
              <h5 className="border-b border-border pb-2 text-xs font-semibold uppercase tracking-widest text-white">
                Links
              </h5>
              <ul className="mt-4 space-y-2 text-sm">
                {footerItems.map((item) => (
                  <li key={item.id} className={getNavVisibilityClasses(item, 'block')}>
                    <NavItemLink item={item} className="transition-colors hover:text-primary" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
