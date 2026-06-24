import React from 'react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { getWhatsAppUrl } from '@/lib/siteConfig'

export function FloatingWhatsApp() {
  const message =
    'Hello, I am interested in browsing your luxury showcase. Can you help me find some premium products?'
  const href = getWhatsAppUrl(message)

  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-white shadow-2xl transition-all duration-300 hover:scale-110 md:h-14 md:w-14 lg:bottom-8 lg:right-8"
      aria-label="Contact via WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6 md:h-7 md:w-7" />
    </a>
  )
}
