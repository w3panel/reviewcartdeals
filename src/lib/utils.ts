import type { Media } from '@/payload-types'

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
