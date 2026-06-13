'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { NavItem } from '@/payload-types'
import { getNavVisibilityClasses } from '@/lib/navVisibility'
import { NavItemLink } from '@/components/NavItemLink'

type NavMegaMenuProps = {
  item: NavItem
  className?: string
}

export function NavMegaMenu({ item, className = '' }: NavMegaMenuProps) {
  const [open, setOpen] = useState(false)
  const visibility = getNavVisibilityClasses(item)
  const children = item.children ?? []

  return (
    <div
      className={`relative ${visibility} ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && children.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-card py-2 shadow-xl">
          {children.map((child) => (
            <NavItemLink
              key={child.id ?? `${child.label}-${child.href}`}
              item={{
                label: child.label,
                href: child.href,
                openInNewTab: child.openInNewTab ?? false,
              }}
              className="block px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-primary"
            />
          ))}
        </div>
      )}
    </div>
  )
}
