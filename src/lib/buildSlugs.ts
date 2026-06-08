import 'server-only'

import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '@/lib/payload'

export type BuildSlugs = {
  categorySlugs: string[]
  productSlugs: string[]
}

function readCachedSlugs(): BuildSlugs | null {
  if (typeof process.cwd !== 'function') {
    return null
  }

  const slugsFile = path.join(process.cwd(), '.next-build', 'slugs.json')
  if (!fs.existsSync(slugsFile)) {
    return null
  }

  return JSON.parse(fs.readFileSync(slugsFile, 'utf-8')) as BuildSlugs
}

async function fetchBuildSlugs(): Promise<BuildSlugs> {
  const payload = await getPayloadClient()

  const categories = await payload.find({
    collection: 'categories',
    limit: 500,
    depth: 0,
    pagination: false,
    select: { slug: true },
  })

  const products = await payload.find({
    collection: 'products',
    limit: 1000,
    depth: 0,
    pagination: false,
    select: { slug: true },
  })

  return {
    categorySlugs: categories.docs.map((doc) => doc.slug),
    productSlugs: products.docs.map((doc) => doc.slug),
  }
}

/**
 * Slugs for generateStaticParams. During production build, reads a file written
 * by the prebuild script so parallel workers do not hammer D1 concurrently.
 */
export async function getBuildSlugs(): Promise<BuildSlugs> {
  if (process.env.VINEXT_BUILD === '1') {
    const cached = readCachedSlugs()
    if (cached) {
      return cached
    }

    throw new Error('Missing .next-build/slugs.json. Run the prebuild script before vinext build.')
  }

  return fetchBuildSlugs()
}
