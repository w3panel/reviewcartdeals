import type { NavItem } from '@/payload-types'
import { isNavItemActive } from '@/components/NavItemLink'

export function isBottomNavItemActive(
  pathname: string,
  item: Pick<NavItem, 'href' | 'icon' | 'label'>,
): boolean {
  if (item.href === '/' || item.icon === 'home') {
    return pathname === '/'
  }

  if (item.icon === 'grid' || item.label.toLowerCase().includes('categor')) {
    return pathname.startsWith('/category') || pathname.startsWith('/search')
  }

  if (item.icon === 'star' || item.label.toLowerCase().includes('review')) {
    return pathname.startsWith('/product/')
  }

  if (item.icon === 'heart' || item.href === '/liked') {
    return pathname.startsWith('/liked')
  }

  if (item.icon === 'clipboardList' || item.icon === 'user' || item.href === '/cart') {
    return pathname.startsWith('/cart')
  }

  return isNavItemActive(pathname, item.href)
}
