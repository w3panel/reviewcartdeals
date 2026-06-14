import React from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { filterNavShell, getNavigation } from '@/services/navigation'
import { getNavVisibilityClasses } from '@/lib/navVisibility'
import { getNavIcon } from '@/lib/navIcons'
import { HeaderCartIcon } from './HeaderCartIcon'
import { HeaderToolbar } from './HeaderToolbar'
import { NavItemLink, getNavButtonClasses } from './NavItemLink'
import { NavMegaMenu } from './NavMegaMenu'

function renderHeaderItem(item: Awaited<ReturnType<typeof getNavigation>>[number]) {
  const visibility = getNavVisibilityClasses(item, 'inline-flex')
  const baseClass = `${visibility} items-center text-sm font-medium transition-colors`.trim()

  if (item.itemType === 'megaMenu') {
    return <NavMegaMenu key={item.id} item={item} className={baseClass} />
  }

  if (item.itemType === 'button') {
    const Icon = getNavIcon(item.icon)
    return (
      <NavItemLink
        key={item.id}
        item={item}
        icon={Icon}
        className={`${baseClass} inline-flex gap-2 rounded-xl px-4 py-2.5 ${getNavButtonClasses(item.styleVariant)}`}
      />
    )
  }

  return (
    <NavItemLink
      key={item.id}
      item={item}
      className={`${baseClass} text-muted-foreground hover:text-primary`}
    />
  )
}

export async function Header({
  navItems,
}: {
  navItems: Awaited<ReturnType<typeof getNavigation>>
}) {
  const headerItems = filterNavShell(navItems, 'header')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-black/95 backdrop-blur-md">
      <div className="relative mx-auto hidden h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:flex lg:h-20 lg:px-8">
        {headerItems.length > 0 && (
          <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-6">
            {headerItems.map(renderHeaderItem)}
          </nav>
        )}

        <div className={`flex items-center gap-4 ${headerItems.length === 0 ? 'ml-auto' : ''}`}>
          <Link
            href="/search"
            className="flex min-w-[280px] items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 transition-colors hover:border-primary/40"
          >
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Search watches, wallets, bags...</span>
          </Link>
          <HeaderCartIcon />
        </div>
      </div>

      <HeaderToolbar navItems={navItems} />
    </header>
  )
}
