import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '@/lib/payload'
import { withPublishedOnly } from '@/lib/publishedOnly'

const SLUGS_FILE = path.join(process.cwd(), '.next-build', 'slugs.json')
const STATIC_PRODUCT_LIMIT = Number(process.env.BUILD_STATIC_PRODUCT_LIMIT ?? 200)
const STATIC_CATEGORY_LIMIT = Number(process.env.BUILD_STATIC_CATEGORY_LIMIT ?? 200)

async function main() {
  const payload = await getPayloadClient()

  const [categories, products] = await Promise.all([
    payload.find({
      collection: 'categories',
      where: withPublishedOnly(),
      limit: STATIC_CATEGORY_LIMIT,
      depth: 0,
      pagination: false,
      select: { slug: true },
      sort: '-featured',
    }),
    payload.find({
      collection: 'products',
      where: withPublishedOnly(),
      limit: STATIC_PRODUCT_LIMIT,
      depth: 0,
      pagination: false,
      select: { slug: true },
      sort: '-featured',
    }),
  ])

  const slugs = {
    categorySlugs: categories.docs.map((doc) => doc.slug),
    productSlugs: products.docs.map((doc) => doc.slug),
  }

  fs.mkdirSync(path.dirname(SLUGS_FILE), { recursive: true })
  fs.writeFileSync(SLUGS_FILE, JSON.stringify(slugs, null, 2))

  console.log(
    `Wrote ${slugs.categorySlugs.length} category and ${slugs.productSlugs.length} product slugs to ${SLUGS_FILE}`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
