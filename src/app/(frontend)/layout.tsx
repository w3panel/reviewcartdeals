import React from 'react'
import './styles.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp'

export const metadata = {
  title: 'ReviewCartDeals | Premium Luxury Showcase & Concierge',
  description: 'Browse our curated collection of luxury watches, designer sunglasses, fine leather goods, and premium accessories. Inquire directly on WhatsApp.',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-luxury-black text-gray-100">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  )
}
