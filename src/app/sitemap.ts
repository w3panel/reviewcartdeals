import type { MetadataRoute } from 'next'

import { getAllPublishedSlugs } from '@/lib/publishedSlugs'
import { getSiteUrl } from '@/lib/siteConfig'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const [productSlugs, categorySlugs] = await Promise.all([
    getAllPublishedSlugs('products'),
    getAllPublishedSlugs('categories'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/cart`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    {
      url: `${siteUrl}/liked`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${siteUrl}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${siteUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
