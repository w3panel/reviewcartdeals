/**
 * Custom Next.js image loader.
 * Uses Cloudflare Image Resizing when NEXT_PUBLIC_IMAGE_CDN_HOST is set;
 * otherwise returns the source URL unchanged (Next still handles format negotiation when optimized).
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  const cdnHost = process.env.NEXT_PUBLIC_IMAGE_CDN_HOST

  if (!cdnHost || src.startsWith('/')) {
    return src
  }

  try {
    const url = new URL(src)
    const params = new URLSearchParams({
      width: String(width),
      quality: String(quality ?? 75),
      format: 'auto',
      fit: 'scale-down',
    })

    return `https://${cdnHost}/cdn-cgi/image/${params.toString()}/${url.hostname}${url.pathname}`
  } catch {
    return src
  }
}
