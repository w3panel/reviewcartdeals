import type { LucideIcon } from 'lucide-react'
import {
  Heart,
  Home,
  LayoutGrid,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Star,
  User,
} from 'lucide-react'
import type { NavItem } from '@/payload-types'

const iconMap: Record<NonNullable<NavItem['icon']>, LucideIcon | null> = {
  none: null,
  home: Home,
  grid: LayoutGrid,
  star: Star,
  heart: Heart,
  user: User,
  message: MessageCircle,
  search: Search,
  menu: Menu,
  phone: Phone,
}

export function getNavIcon(icon: NavItem['icon'] | null | undefined): LucideIcon | null {
  if (!icon || icon === 'none') return null
  return iconMap[icon] ?? null
}
