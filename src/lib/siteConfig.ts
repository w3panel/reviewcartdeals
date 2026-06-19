const DEV_WHATSAPP_PLACEHOLDER = '1234567890'

let warnedMissingWhatsApp = false

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://reviewcartdeals.com'
}

export function getWhatsAppNumber(): string | null {
  const value = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()
  if (value) return value

  if (process.env.NODE_ENV === 'development' && !warnedMissingWhatsApp) {
    warnedMissingWhatsApp = true
    console.warn(
      '[siteConfig] NEXT_PUBLIC_WHATSAPP_NUMBER is unset; WhatsApp links are disabled in development.',
    )
  }

  return null
}

export function getWhatsAppUrl(message?: string): string | null {
  const number = getWhatsAppNumber()
  if (!number) return null

  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/** Fallback only for legacy call sites during migration; prefer getWhatsAppNumber(). */
export function getWhatsAppNumberOrPlaceholder(): string {
  return getWhatsAppNumber() ?? DEV_WHATSAPP_PLACEHOLDER
}
