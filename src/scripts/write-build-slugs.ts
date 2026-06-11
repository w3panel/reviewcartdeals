import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '@/lib/payload'

const SLUGS_FILE = path.join(process.cwd(), '.next-build', 'slugs.json')

async function main() {
  const payload = await getPayloadClient()

  const [categories, products] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 500,
      depth: 0,
      pagination: false,
      select: { slug: true },
    }),
    payload.find({
      collection: 'products',
      limit: 1000,
      depth: 0,
      pagination: false,
      select: { slug: true },
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
