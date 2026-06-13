import type { NavItem } from '@/payload-types'

export type NavShell = 'header' | 'bottom' | 'footer' | 'toolbar'

export function itemHasPlacement(item: Pick<NavItem, 'placements'>, shell: NavShell): boolean {
  return item.placements?.includes(shell) ?? false
}

export function getNavShellItems(items: NavItem[], shell: NavShell): NavItem[] {
  return items.filter((item) => item.enabled !== false && itemHasPlacement(item, shell))
}

export function shellHasVisibleItems(items: NavItem[], shell: NavShell): boolean {
  return getNavShellItems(items, shell).some((item) => hasAnyDeviceVisibility(item))
}

export function hasAnyDeviceVisibility(
  item: Pick<NavItem, 'showOnDesktop' | 'showOnTablet' | 'showOnMobile'>,
): boolean {
  return Boolean(item.showOnDesktop || item.showOnTablet || item.showOnMobile)
}

export function bottomNavShouldRender(items: NavItem[]): boolean {
  const bottomItems = getNavShellItems(items, 'bottom')
  return bottomItems.some((item) => item.showOnMobile || item.showOnTablet)
}
