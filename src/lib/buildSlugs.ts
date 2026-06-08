import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '@/lib/payload'

export type BuildSlugs = {
  categorySlugs: string[]
  productSlugs: string[]
}

const SLUGS_FILE = path.join(process.cwd(), '.next-build', 'slugs.json')

function readCachedSlugs(): BuildSlugs | null {
  if (!fs.existsSync(SLUGS_FILE)) {
    return null
  }

  return JSON.parse(fs.readFileSync(SLUGS_FILE, 'utf-8')) as BuildSlugs
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
 * Slugs for generateStaticParams. During `next build`, reads a file written
 * by the prebuild script so parallel workers do not hammer D1 concurrently.
 */
export async function getBuildSlugs(): Promise<BuildSlugs> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const cached = readCachedSlugs()
    if (cached) {
      return cached
    }

    throw new Error(
      `Missing ${SLUGS_FILE}. The prebuild script should run before next build.`,
    )
  }

  return fetchBuildSlugs()
}
