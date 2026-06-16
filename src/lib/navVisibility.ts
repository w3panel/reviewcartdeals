import type { NavItem } from '@/payload-types'

type NavVisibility = Pick<NavItem, 'showOnDesktop' | 'showOnTablet' | 'showOnMobile'>
type DisplayMode = 'flex' | 'inline-flex' | 'block'

/** Full class strings so Tailwind v4 can detect them at build time. */
const visibilityClassMap: Record<string, Record<DisplayMode, string>> = {
  // mobile only (< lg, matches mobile header / bottom bar)
  '100': {
    flex: 'flex lg:hidden',
    'inline-flex': 'inline-flex lg:hidden',
    block: 'block lg:hidden',
  },
  // tablet only (md–lg)
  '010': {
    flex: 'hidden md:flex lg:hidden',
    'inline-flex': 'hidden md:inline-flex lg:hidden',
    block: 'hidden md:block lg:hidden',
  },
  // desktop only (lg+)
  '001': {
    flex: 'hidden lg:flex',
    'inline-flex': 'hidden lg:inline-flex',
    block: 'hidden lg:block',
  },
  // mobile + tablet
  '110': {
    flex: 'flex lg:hidden',
    'inline-flex': 'inline-flex lg:hidden',
    block: 'block lg:hidden',
  },
  // mobile + desktop (not tablet)
  '101': {
    flex: 'flex md:hidden lg:flex',
    'inline-flex': 'inline-flex md:hidden lg:inline-flex',
    block: 'block md:hidden lg:block',
  },
  // tablet + desktop
  '011': {
    flex: 'hidden md:flex',
    'inline-flex': 'hidden md:inline-flex',
    block: 'hidden md:block',
  },
  // all breakpoints
  '111': {
    flex: '',
    'inline-flex': '',
    block: '',
  },
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
  return visibilityClassMap[key]?.[display] ?? 'hidden'
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
  if (mobile && tablet) return 'flex lg:hidden'
  if (mobile && !tablet && !desktop) return 'flex lg:hidden'
  if (!mobile && tablet && !desktop) return 'hidden md:flex lg:hidden'
  if (!mobile && !tablet && desktop) return 'hidden lg:flex'
  if (mobile && desktop && !tablet) return 'max-md:flex lg:flex md:hidden'
  if (!mobile && tablet && desktop) return 'hidden md:flex'

  return 'flex lg:hidden'
}
