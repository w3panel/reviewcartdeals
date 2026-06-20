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
      className="fixed bottom-20 right-4 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-2xl transition-all duration-300 hover:scale-110 md:flex md:bottom-8 md:right-8"
      aria-label="Contact via WhatsApp"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
