import React from 'react'
import './styles.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp'
import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/providers/ThemeProvider'

export const metadata = {
  title: 'ReviewCartDeals | Premium Luxury Showcase & Concierge',
  description: 'Browse our curated collection of luxury watches, designer sunglasses, fine leather goods, and premium accessories. Inquire directly on WhatsApp.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <CartProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <FloatingWhatsApp />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
