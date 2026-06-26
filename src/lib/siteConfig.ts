const DEV_WHATSAPP_PLACEHOLDER = '1234567890'

let warnedMissingWhatsApp = false

export function getSiteUrl(): string {
  const fromPublicEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromPublicEnv) {
    return fromPublicEnv.replace(/\/+$/, '')
  }

  const vercelHost = process.env.VERCEL_URL?.trim()
  if (vercelHost) {
    return `https://${vercelHost.replace(/\/+$/, '')}`
  }

  return 'https://reviewcartdeals.vercel.app'
}

export function buildFloatingWhatsAppMessage(siteUrl: string): string {
  return `Hello,\n\nI am interested in browsing your luxury showcase. Can you help me find some premium products?\n\nWebsite:\n${siteUrl}`
}

export function buildProductEnquiryWhatsAppMessage(
  product: { title: string; slug: string },
  siteUrl: string,
): string {
  const productUrl = `${siteUrl.replace(/\/+$/, '')}/product/${product.slug}`
  return `Hello,\n\nI am interested in this product:\n\nProduct Name: ${product.title}\nProduct URL: ${productUrl}\n\nPlease share more details.`
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
