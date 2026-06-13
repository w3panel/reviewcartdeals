import type { NavItem } from '@/payload-types'

type NavVisibility = Pick<NavItem, 'showOnDesktop' | 'showOnTablet' | 'showOnMobile'>
type DisplayMode = 'flex' | 'inline-flex' | 'block'

const visibilityClassMap: Record<string, string> = {
  '100': 'DISPLAY md:hidden',
  '010': 'hidden md:DISPLAY lg:hidden',
  '001': 'hidden lg:DISPLAY',
  '110': 'DISPLAY lg:hidden',
  '101': 'max-md:DISPLAY lg:DISPLAY md:hidden',
  '011': 'hidden md:DISPLAY',
  '111': '',
}

export function getNavVisibilityClasses(
  item: NavVisibility,
  display: DisplayMode = 'flex',
): string {
  const mobile = item.showOnMobile !== false
  const tablet = item.showOnTablet !== false
  const desktop = item.showOnDesktop !== false

  if (!mobile && !tablet && !desktop) return 'hidden'

  const key = `${mobile ? 1 : 0}${tablet ? 1 : 0}${desktop ? 1 : 0}`
  const pattern = visibilityClassMap[key] ?? 'hidden'

  if (!pattern) return ''

  return pattern.replace(/DISPLAY/g, display)
}

export function getBottomNavShellClasses(items: NavItem[]): string {
  const bottomItems = items.filter(
    (item) => item.enabled !== false && item.placements?.includes('bottom'),
  )

  if (bottomItems.length === 0) return 'hidden'

  const mobile = bottomItems.some((item) => item.showOnMobile !== false)
  const tablet = bottomItems.some((item) => item.showOnTablet !== false)
  const desktop = bottomItems.some((item) => item.showOnDesktop !== false)

  if (mobile && tablet && desktop) return 'flex'
  if (mobile && tablet) return 'lg:hidden flex'
  if (mobile && !tablet && !desktop) return 'flex md:hidden'
  if (!mobile && tablet && !desktop) return 'hidden md:flex lg:hidden'
  if (!mobile && !tablet && desktop) return 'hidden lg:flex'
  if (mobile && desktop && !tablet) return 'max-md:flex lg:flex md:hidden'
  if (!mobile && tablet && desktop) return 'hidden md:flex'

  return 'md:hidden flex'
}
