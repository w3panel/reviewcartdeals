import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'

export type BuildSlugs = {
  categorySlugs: string[]
  productSlugs: string[]
}

const SLUGS_FILE = path.join(process.cwd(), '.next-build', 'slugs.json')
const STATIC_PRODUCT_LIMIT = Number(process.env.BUILD_STATIC_PRODUCT_LIMIT ?? 200)
const STATIC_CATEGORY_LIMIT = Number(process.env.BUILD_STATIC_CATEGORY_LIMIT ?? 200)

function limitSlugs<T extends { slug: string }>(docs: T[], limit: number): string[] {
  return docs.slice(0, limit).map((doc) => doc.slug)
}

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
    where: withPublishedOnly(),
    limit: STATIC_CATEGORY_LIMIT,
    depth: 0,
    pagination: false,
    select: { slug: true },
    sort: '-featured',
  })

  const products = await payload.find({
    collection: 'products',
    where: withPublishedOnly(),
    limit: STATIC_PRODUCT_LIMIT,
    depth: 0,
    pagination: false,
    select: { slug: true },
    sort: '-featured',
  })

  return {
    categorySlugs: limitSlugs(categories.docs, STATIC_CATEGORY_LIMIT),
    productSlugs: limitSlugs(products.docs, STATIC_PRODUCT_LIMIT),
  }
}

/**
 * Slugs for generateStaticParams. During `next build`, reads a file written
 * by the prebuild script so parallel workers do not hammer Postgres concurrently.
 */
export async function getBuildSlugs(): Promise<BuildSlugs> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const cached = readCachedSlugs()
    if (cached) {
      return cached
    }

    throw new Error(`Missing ${SLUGS_FILE}. The prebuild script should run before next build.`)
  }

  return fetchBuildSlugs()
}
