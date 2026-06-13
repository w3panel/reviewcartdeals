import React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import type { NavItem } from '@/payload-types'

type NavItemLinkProps = {
  item: Pick<NavItem, 'label' | 'href' | 'openInNewTab' | 'styleVariant'>
  className?: string
  children?: React.ReactNode
  icon?: LucideIcon | null
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

export function getNavButtonClasses(
  styleVariant: NavItem['styleVariant'] | null | undefined,
  className = '',
): string {
  const base =
    styleVariant === 'whatsapp'
      ? 'bg-whatsapp text-white hover:opacity-90'
      : styleVariant === 'primary'
        ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
        : styleVariant === 'iconOnly'
          ? 'border border-primary bg-black text-primary hover:bg-primary/10'
          : 'text-muted-foreground hover:text-primary'

  return `${base} ${className}`.trim()
}

export function NavItemLink({ item, className = '', children, icon: Icon }: NavItemLinkProps) {
  const content = children ?? (
    <>
      {Icon ? <Icon className="h-4 w-4 flex-shrink-0" /> : null}
      {item.styleVariant !== 'iconOnly' ? <span>{item.label}</span> : null}
    </>
  )
  const external = isExternalHref(item.href)

  if (external || item.openInNewTab) {
    return (
      <a
        href={item.href}
        className={className}
        target={item.openInNewTab || external ? '_blank' : undefined}
        rel={item.openInNewTab || external ? 'noopener noreferrer' : undefined}
        aria-label={item.styleVariant === 'iconOnly' ? item.label : undefined}
      >
        {content}
      </a>
    )
  }

  if (item.href === '#') {
    return (
      <span className={className} aria-label={item.label}>
        {content}
      </span>
    )
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-label={item.styleVariant === 'iconOnly' ? item.label : undefined}
    >
      {content}
    </Link>
  )
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (isExternalHref(href) || href === '#') return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
