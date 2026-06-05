import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function seedReviews() {
  try {
    const payload = await getPayload({ config: configPromise })

    const products = await payload.find({
      collection: 'products',
      limit: 1,
    })

    if (products.docs.length === 0) {
      console.log('No products found to add reviews to.')
      process.exit(0)
    }

    const firstProduct = products.docs[0]

    await payload.create({
      collection: 'reviews',
      data: {
        product: firstProduct.id,
        reviewerName: 'John Doe',
        rating: 5,
        comment: 'Absolutely stunning. The craftsmanship is unparalleled and it exceeded all my expectations.',
        verifiedPurchase: true,
      },
    })

    await payload.create({
      collection: 'reviews',
      data: {
        product: firstProduct.id,
        reviewerName: 'Jane Smith',
        rating: 4,
        comment: 'Very high quality, but took a little longer to ship than expected. Still highly recommend.',
        verifiedPurchase: true,
      },
    })

    console.log('Successfully seeded 2 reviews for product:', firstProduct.title)
    process.exit(0)
  } catch (error) {
    console.error('Failed to seed reviews:', error)
    process.exit(1)
  }
}

seedReviews()
