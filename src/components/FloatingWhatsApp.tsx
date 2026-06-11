import React from 'react'
import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
  const message =
    'Hello, I am interested in browsing your luxury showcase. Can you help me find some premium products?'

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-2xl transition-all duration-300 hover:scale-110 md:bottom-8 md:right-8"
      aria-label="Contact via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
