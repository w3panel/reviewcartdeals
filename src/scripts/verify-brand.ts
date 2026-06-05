import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function verifyFirstBrand() {
  try {
    const payload = await getPayload({ config: configPromise })

    const brands = await payload.find({
      collection: 'brands',
      limit: 1,
    })

    if (brands.docs.length > 0) {
      const brand = brands.docs[0]
      await payload.update({
        collection: 'brands',
        id: brand.id,
        data: {
          verified: true,
        },
      })
      console.log(`Successfully verified brand: ${brand.title}`)
    }
    process.exit(0)
  } catch (error) {
    console.error('Failed to verify brand:', error)
    process.exit(1)
  }
}

verifyFirstBrand()
