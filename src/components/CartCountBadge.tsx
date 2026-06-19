'use client'

import React from 'react'

type CartCountBadgeProps = {
  count: number
  className?: string
}

export function CartCountBadge({ count, className = '' }: CartCountBadgeProps) {
  if (count <= 0) return null

  const label = count > 99 ? '99+' : String(count)

  return (
    <span
      className={`absolute -top-1.5 -right-1.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border border-black bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ${className}`.trim()}
      aria-hidden
    >
      {label}
    </span>
  )
}

export function isCartNavItem(item: { href: string; icon?: string | null }): boolean {
  return item.icon === 'clipboardList' || item.href === '/cart'
}
