import React from 'react'
import Link from 'next/link'
import { MessageCircle, Shield, Award, Clock } from 'lucide-react'

export async function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'

  return (
    <footer className="border-t border-border bg-card text-muted-foreground hidden md:block">
      <div className="border-b border-border bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Award className="h-6 w-6 text-primary" />
              <h4 className="text-sm font-semibold tracking-wider text-foreground">Curated Luxury</h4>
              <p className="text-xs">Premium watches, leather goods, and designer accessories.</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h4 className="text-sm font-semibold tracking-wider text-foreground">Secure Inquiry</h4>
              <p className="text-xs">Discuss details and delivery privately on WhatsApp.</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <h4 className="text-sm font-semibold tracking-wider text-foreground">24/7 Support</h4>
              <p className="text-xs">Our concierge team is ready to answer your enquiries.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-serif text-2xl font-bold tracking-widest text-foreground">
              Review<span className="gold-text-gradient">Cart</span>Deals
            </span>
            <p className="mt-4 text-sm max-w-md leading-relaxed">
              Discover a curated catalog of exquisite timepieces, designer bags, and premium accessories.
              Connect directly with our team on WhatsApp for personal assistance.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-foreground border-b border-border pb-2">
              Platform
            </h5>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/search" className="hover:text-primary transition-colors">Browse Catalog</Link></li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-whatsapp" />
                  Concierge Chat
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} ReviewCartDeals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
