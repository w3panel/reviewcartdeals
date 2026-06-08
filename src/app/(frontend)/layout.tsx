import React from 'react'
import './styles.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp'
import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { LikedProvider } from '@/context/LikedContext'

import { BottomNav } from '@/components/BottomNav'

export const metadata = {
  title: 'ReviewCartDeals | Premium Luxury Showcase & Concierge',
  description: 'Browse our curated collection of luxury watches, designer sunglasses, fine leather goods, and premium accessories. Inquire directly on WhatsApp.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground pb-16 md:pb-0">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <CartProvider>
            <LikedProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <BottomNav />
              <FloatingWhatsApp />
            </LikedProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
