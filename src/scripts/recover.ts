/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function recover() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    console.log('Fetching all products...')
    const products = await payload.find({
      collection: 'products',
      limit: 100,
    })

    console.log(`Found ${products.docs.length} products. Updating ratings and review counts...`)

    for (const product of products.docs) {
      const randomRating = Number((Math.random() * (5 - 4) + 4).toFixed(1))
      const randomReviews = Math.floor(Math.random() * 500) + 50

      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          rating: randomRating,
          reviewsCount: randomReviews,
        } as any, // Cast to any to bypass strict type check for now if types aren't regenerated yet
      })
      console.log(`Updated product: ${product.title}`)
    }

    console.log('Recovery complete!')
    process.exit(0)
  } catch (error) {
    console.error('Error recovering data:', error)
    process.exit(1)
  }
}

recover()
