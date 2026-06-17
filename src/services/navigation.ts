import { unstable_cache } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cacheTags'
import { getPayloadClient } from '@/lib/payload'
import { getNavShellItems, type NavShell } from '@/lib/navShells'
import { withQueryTiming } from '@/lib/observability'
import type { NavItem } from '@/payload-types'

export type { NavShell }

const DATA_REVALIDATE_SECONDS = 300

async function fetchNavigation(): Promise<NavItem[]> {
  const payload = await getPayloadClient()

  const response = await payload.find({
    collection: 'nav-items',
    where: {
      enabled: {
        equals: true,
      },
    },
    sort: 'sortOrder',
    limit: 100,
    depth: 0,
    pagination: false,
  })

  return response.docs as NavItem[]
}

export async function getNavigation(): Promise<NavItem[]> {
  return unstable_cache(
    async () => withQueryTiming('getNavigation', fetchNavigation),
    ['navigation-items'],
    { tags: [CACHE_TAGS.nav], revalidate: DATA_REVALIDATE_SECONDS },
  )()
}

export function filterNavShell(items: NavItem[], shell: NavShell): NavItem[] {
  return getNavShellItems(items, shell)
}

/** @deprecated Use getNavigation() + filterNavShell() */
export async function getNavItemsByPlacement(shell: NavShell): Promise<NavItem[]> {
  const items = await getNavigation()
  return filterNavShell(items, shell)
}

/** @deprecated Use getNavigation() + filterNavShell() */
export async function getBottomNavItems(): Promise<NavItem[]> {
  return getNavItemsByPlacement('bottom')
}
