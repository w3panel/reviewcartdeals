import type { Media, Product } from '@/payload-types'
import { FALLBACK_IMAGE_SRC } from '@/lib/imageFallback'

type MediaWithSizes = Media & {
  sizes?: {
    thumbnail?: { url?: string | null }
    card?: { url?: string | null }
  }
}

export type ImageSizeName = 'thumbnail' | 'card' | 'original'

/**
 * Safely extracts the image URL from a Payload relationship field,
 * which can be populated as a Media object or left as an ID (number).
 */
export function getImageUrl(
  image: number | Media | undefined | null,
  preferredSize: ImageSizeName = 'original',
): string {
  if (image && typeof image === 'object') {
    if (preferredSize !== 'original') {
      const sizedUrl = (image as MediaWithSizes).sizes?.[preferredSize]?.url
      if (sizedUrl) return sizedUrl
    }

    if (image.url) {
      return image.url
    }
  }

  return FALLBACK_IMAGE_SRC
}

type GalleryRow = NonNullable<Product['gallery']>[number]

function isMediaObject(value: unknown): value is Media {
  return value !== null && typeof value === 'object' && 'id' in value
}

/** Extract a media reference from a gallery array row (supports current and legacy shapes). */
function getMediaFromGalleryRow(
  row: GalleryRow | Media | null | undefined,
): number | Media | null | undefined {
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

/** Brand display name when the relationship is populated; null when unset. */
export function getProductBrandTitle(product: Pick<Product, 'brand'>): string | null {
  const brand = product.brand
  if (brand == null) return null
  if (typeof brand === 'object' && brand !== null && 'title' in brand) {
    return brand.title
  }
  return null
}

/** First gallery image — used as listing thumbnail. */
export function getProductMainImage(product: Product): number | Media | null | undefined {
  if (product.enableVariants) {
    const firstValueGallery = product.valueGalleries?.find((row) => row.gallery?.length)
    const firstImage = firstValueGallery?.gallery?.[0]
    const fromValueGallery = getMediaFromGalleryRow(firstImage)
    if (fromValueGallery) return fromValueGallery
  }

  if (!product.gallery?.length) return undefined
  return getMediaFromGalleryRow(product.gallery[0])
}

/** All populated gallery images in order for the product page carousel. */
export function buildProductGalleryImages(product: Product): Media[] {
  if (product.enableVariants) {
    const fromValueGalleries = (product.valueGalleries ?? [])
      .flatMap((row) => row.gallery ?? [])
      .map((row) => getMediaFromGalleryRow(row))
      .filter(isMediaObject)

    if (fromValueGalleries.length > 0) return fromValueGalleries
  }

  if (!product.gallery?.length) return []

  return product.gallery.map((row) => getMediaFromGalleryRow(row)).filter(isMediaObject)
}
