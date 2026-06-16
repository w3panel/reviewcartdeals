import React from 'react'
import './styles.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp'
import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { LikedProvider } from '@/context/LikedContext'
import { FilterSheetProvider } from '@/context/FilterSheetContext'
import { NavigationProvider } from '@/context/NavigationContext'
import { BottomNav } from '@/components/BottomNav'
import { getNavigation } from '@/services/navigation'

export const metadata = {
  title: 'Premium Luxury Showcase & Concierge',
  description:
    'Browse our curated collection of luxury watches, designer sunglasses, fine leather goods, and premium accessories. Inquire directly on WhatsApp.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const navItems = await getNavigation()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-background text-foreground pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <CartProvider>
            <LikedProvider>
              <FilterSheetProvider>
                <NavigationProvider items={navItems}>
                  <Header navItems={navItems} />
                  <main className="flex-grow">{children}</main>
                  <Footer navItems={navItems} />
                  <BottomNav />
                  <FloatingWhatsApp />
                </NavigationProvider>
              </FilterSheetProvider>
            </LikedProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
