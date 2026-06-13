'use client'

import React, { createContext, useContext } from 'react'
import type { NavItem } from '@/payload-types'

type NavigationContextValue = {
  items: NavItem[]
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({
  items,
  children,
}: {
  items: NavItem[]
  children: React.ReactNode
}) {
  return <NavigationContext.Provider value={{ items }}>{children}</NavigationContext.Provider>
}

export function useNavigationItems(): NavItem[] {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigationItems must be used within NavigationProvider')
  }
  return context.items
}

export function useNavigationShell(shell: NavItem['placements'][number]): NavItem[] {
  const items = useNavigationItems()
  return items.filter((item) => item.enabled !== false && item.placements?.includes(shell))
}
