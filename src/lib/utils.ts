import type { Media, Product } from '@/payload-types'

/**
 * Safely extracts the image URL from a Payload relationship field,
 * which can be populated as a Media object or left as an ID (number).
 */
export function getImageUrl(image: number | Media | undefined | null): string {
  if (image && typeof image === 'object' && image.url) {
    return image.url
  }
  return '/placeholder.webp'
}

type GalleryRow = NonNullable<Product['gallery']>[number]

function isMediaObject(value: unknown): value is Media {
  return value !== null && typeof value === 'object' && 'id' in value
}

/** Extract a media reference from a gallery array row (supports current and legacy shapes). */
function getMediaFromGalleryRow(row: GalleryRow | Media | null | undefined): number | Media | null | undefined {
  if (!row || typeof row !== 'object') return undefined

  // Current shape: { image: Media | number }
  if ('image' in row) {
    return row.image ?? undefined
  }

  // Legacy shape: row is the media object directly
  if ('url' in row || 'id' in row) {
    return row as Media
  }

  return undefined
}

/** First gallery image — used as listing thumbnail. */
export function getProductMainImage(product: Product): number | Media | null | undefined {
  if (!product.gallery?.length) return undefined
  return getMediaFromGalleryRow(product.gallery[0])
}

/** All populated gallery images in order for the product page carousel. */
export function buildProductGalleryImages(product: Product): Media[] {
  if (!product.gallery?.length) return []

  return product.gallery
    .map((row) => getMediaFromGalleryRow(row))
    .filter(isMediaObject)
}
