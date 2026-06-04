/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function seed() {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    // 1. Check if categories already exist to avoid double-seeding
    const existingCats = await payload.find({
      collection: 'categories',
      limit: 1,
    })

    if (existingCats.docs.length > 0) {
      console.log('Database already has category data. Seeding skipped.')
      process.exit(0)
    }

    // Helper to upload media from the seed assets
    const uploadMedia = async (fileName: string, altText: string) => {
      const filePath = path.join(process.cwd(), 'public/seed', fileName)
      if (!fs.existsSync(filePath)) {
        throw new Error(`Seed file not found at ${filePath}`)
      }
      const fileBuffer = fs.readFileSync(filePath)
      return await payload.create({
        collection: 'media',
        data: {
          alt: altText,
        },
        file: {
          data: fileBuffer,
          name: fileName,
          mimetype: 'image/webp',
          size: fileBuffer.length,
        },
      })
    }

    // 2. Upload seed images
    await uploadMedia('hero_luxury.webp', 'Luxury Hero Banner')
    const mediaWatch = await uploadMedia('rolex_watch.webp', 'Rolex Watch Gold Black')
    const mediaGlasses = await uploadMedia('gucci_sunglasses.webp', 'Gucci Sunglasses Gold Black')
    const mediaBag = await uploadMedia('lv_bag.webp', 'Louis Vuitton Pouch')
    const mediaWallet = await uploadMedia('woodland_wallet.webp', 'Woodland Leather Wallet')
    const mediaRing = await uploadMedia('gucci_ring.webp', 'Gucci Gold Black Ring')

    // 3. Create Categories
    const catWatch = await payload.create({
      collection: 'categories',
      data: {
        title: 'WATCH',
        slug: 'watch',
        image: mediaWatch.id,
        description: 'Exquisite timepieces representing Swiss heritage and premium craftsmanship.',
        featured: true,
      },
    })

    const catWallet = await payload.create({
      collection: 'categories',
      data: {
        title: 'WALLET',
        slug: 'wallet',
        image: mediaWallet.id,
        description: 'Premium handcrafted leather wallets, cardholders, and passport sleeves.',
        featured: true,
      },
    })

    const catSunglasses = await payload.create({
      collection: 'categories',
      data: {
        title: 'SUN GLASS',
        slug: 'sun-glass',
        image: mediaGlasses.id,
        description: 'Designer frames and luxury eyewear tailored for dynamic profiles.',
        featured: true,
      },
    })

    const catBag = await payload.create({
      collection: 'categories',
      data: {
        title: 'BAG',
        slug: 'bag',
        image: mediaBag.id,
        description: 'Luxury travel bags, designer backpacks, pouches, and card cases.',
        featured: true,
      },
    })

    const catAccessories = await payload.create({
      collection: 'categories',
      data: {
        title: 'ACCESSORIES',
        slug: 'accessories',
        image: mediaRing.id,
        description: 'High-end rings, gold bracelets, designer belts, and luxury jewelry.',
        featured: true,
      },
    })

    // Basic Lexical JSON format for fullDescription
    const createLexicalDescription = (text: string) => {
      return {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'text',
                  text: text,
                  version: 1,
                },
              ],
            },
          ],
        },
      } as any
    }

    // 4. Create Products
    // Product 1: Hublot Watch
    await payload.create({
      collection: 'products',
      data: {
        title: 'Hublot Big Bang Gold Edition',
        slug: 'hublot-big-bang-gold-edition',
        brand: 'Hublot',
        shortDescription: 'The Hublot Big Bang features a satin-finished 18K king gold case, combining luxury with rugged ceramic aesthetics.',
        fullDescription: createLexicalDescription(
          'An icon of modern horology, the Hublot Big Bang Gold Edition merges traditional Swiss watchmaking with futuristic materials. Featuring a robust satin-finished 18K king gold case, a matte black dial, and the signature black structured rubber strap, it is a statement timepiece for collectors who demand bold elegance.'
        ),
        image: mediaWatch.id,
        category: catWatch.id,
        featured: true,
        specifications: [
          { key: 'Case Size', value: '44 mm' },
          { key: 'Case Material', value: 'Satin-Finished & Polished 18K King Gold' },
          { key: 'Bezel', value: 'Satin-Finished, Polished & Microblasted Black Ceramic' },
          { key: 'Water Resistance', value: '100m or 10 ATM' },
          { key: 'Power Reserve', value: '42 Hours' },
        ],
        seo: {
          title: 'Hublot Big Bang Gold Edition - Luxury Watch',
          description: 'Explore the Hublot Big Bang Gold Edition watch featuring 18K king gold and a microblasted black ceramic bezel.',
        },
        tags: [{ tag: 'watch' }, { tag: 'gold' }, { tag: 'luxury' }],
      },
    })

    // Product 2: Gucci Sunglasses
    await payload.create({
      collection: 'products',
      data: {
        title: 'Gucci Premium Black & Gold Sunglasses',
        slug: 'gucci-premium-black-gold-sunglasses',
        brand: 'Gucci',
        shortDescription: 'Chic black acetate square frame sunglasses highlighted by gold-toned temples with the classic interlocking double-G logo.',
        fullDescription: createLexicalDescription(
          'Elevate your daily profile with these Gucci Premium sunglasses. Handcrafted in Italy from high-grade black acetate, they feature gold-toned metal temples detailed with the iconic Interlocking G logo. The dark grey lenses provide 100% UVA/UVB protection, blending fashion with optimal visual performance.'
        ),
        image: mediaGlasses.id,
        category: catSunglasses.id,
        featured: true,
        specifications: [
          { key: 'Frame Color', value: 'Shiny Black' },
          { key: 'Temple Color', value: 'Gold-Toned Metal' },
          { key: 'Lens Color', value: 'Dark Grey' },
          { key: 'UV Protection', value: '100% UVA/UVB' },
          { key: 'Origin', value: 'Made in Italy' },
        ],
        seo: {
          title: 'Gucci Premium Black & Gold Sunglasses - Designer Eyewear',
          description: 'Elevate your profile with the Gucci Premium Black & Gold square-frame sunglasses featuring the interlocking double-G logo.',
        },
        tags: [{ tag: 'sunglasses' }, { tag: 'eyewear' }, { tag: 'gucci' }],
      },
    })

    // Product 3: LV Pouch
    await payload.create({
      collection: 'products',
      data: {
        title: 'LV Signature Executive Pouch',
        slug: 'lv-signature-executive-pouch',
        brand: 'Louis Vuitton',
        shortDescription: 'Crafted from premium black Taurillon leather, the LV Signature Executive Pouch features gold hardware and a spacious interior.',
        fullDescription: createLexicalDescription(
          'A sophisticated companion for the modern executive. Crafted from rich black Taurillon leather and embossed with Louis Vuitton’s heritage monogram motif, this pouch includes gold-toned zipper hardware and a structured wrist strap. Inside features card slots and a flat pocket to secure your daily essentials.'
        ),
        image: mediaBag.id,
        category: catBag.id,
        featured: true,
        specifications: [
          { key: 'Material', value: 'Taurillon Monogram Embossed Leather' },
          { key: 'Dimensions', value: '27.0 x 21.0 x 6.0 cm' },
          { key: 'Hardware', value: 'Gold-Finished Metal' },
          { key: 'Pockets', value: '1 Main Compartment, 6 Card Slots, 1 Inside Flat Pocket' },
        ],
        seo: {
          title: 'LV Signature Executive Pouch - Luxury Leather Pouch',
          description: 'Shop the LV Signature Executive Pouch in black embossed Taurillon leather with gold-finished hardware.',
        },
        tags: [{ tag: 'bag' }, { tag: 'leather' }, { tag: 'pouch' }],
      },
    })

    // Product 4: Seiko Watch
    await payload.create({
      collection: 'products',
      data: {
        title: 'Seiko Premium Black Gold Automatic Watch',
        slug: 'seiko-premium-black-gold-automatic-watch',
        brand: 'Seiko',
        shortDescription: 'An automatic mechanical watch presenting a gold stainless steel case, black dial, and gold accents.',
        fullDescription: createLexicalDescription(
          'Blending timeless Japanese precision with rich luxury styling, the Seiko Premium Automatic Watch features a solid stainless steel case with a durable gold-toned finish, a deep black dial with luminescent indices, and an exhibition case back showing the automatic Caliber movement.'
        ),
        image: mediaWatch.id,
        category: catWatch.id,
        featured: true,
        specifications: [
          { key: 'Caliber', value: 'Automatic Caliber 4R36' },
          { key: 'Case Size', value: '42.5 mm' },
          { key: 'Water Resistance', value: '100m / 10 ATM' },
          { key: 'Material', value: 'Gold-Finished Stainless Steel' },
        ],
        seo: {
          title: 'Seiko Premium Black Gold Automatic Watch - mechanical luxury',
          description: 'Discover the Seiko Premium Automatic watch featuring gold-finished stainless steel and Lumibrite indicators.',
        },
        tags: [{ tag: 'watch' }, { tag: 'seiko' }, { tag: 'automatic' }],
      },
    })

    // Product 5: Gucci Ring
    await payload.create({
      collection: 'products',
      data: {
        title: 'Gucci Noir Signature Ring',
        slug: 'gucci-noir-signature-ring',
        brand: 'Gucci',
        shortDescription: 'A modern black zirconia band ring with gold interlocking double-G logos set in 18k yellow gold.',
        fullDescription: createLexicalDescription(
          'Daring and contemporary, the Gucci Noir Signature Ring is crafted from glossy black zirconia ceramic, bordered by twin bands of 18k yellow gold. The face of the ring is adorned with gold interlocking double-G studs, encapsulating luxury streetwear aesthetics.'
        ),
        image: mediaRing.id,
        category: catAccessories.id,
        featured: true,
        specifications: [
          { key: 'Material', value: 'Black Zirconia Ceramic & 18K Yellow Gold' },
          { key: 'Width', value: '7 mm' },
          { key: 'Origin', value: 'Made in Italy' },
        ],
        seo: {
          title: 'Gucci Noir Signature Ring - 18k Gold & Black Ceramic',
          description: 'A contemporary Gucci band ring made with black zirconia ceramic and 18k yellow gold interlocking double-G logos.',
        },
        tags: [{ tag: 'accessories' }, { tag: 'ring' }, { tag: 'gold' }],
      },
    })

    // Product 6: Woodland Wallet
    await payload.create({
      collection: 'products',
      data: {
        title: 'Woodland Vintage Leather Wallet',
        slug: 'woodland-vintage-leather-wallet',
        brand: 'Woodland',
        shortDescription: 'Premium vintage brown leather bifold wallet with hand-stitched details and a gold-plated logo plaque.',
        fullDescription: createLexicalDescription(
          'Handcrafted from select full-grain cowhide leather, the Woodland Vintage bifold wallet patinas beautifully over time. Featuring a classic bifold layout with eight card slots, dual bill compartments, and a gold-plated brass logo accent, it delivers timeless luxury for daily use.'
        ),
        image: mediaWallet.id,
        category: catWallet.id,
        featured: true,
        specifications: [
          { key: 'Material', value: 'Full-Grain Cowhide Leather' },
          { key: 'Style', value: 'Bifold Wallet' },
          { key: 'Capacity', value: '8 Card Slots, 2 Bill Sections, 2 Slip Pockets' },
        ],
        seo: {
          title: 'Woodland Vintage Leather Wallet - Handcrafted Bifold',
          description: 'Discover the Woodland Vintage Leather Wallet featuring full-grain cowhide leather and a gold logo plaque.',
        },
        tags: [{ tag: 'wallet' }, { tag: 'leather' }, { tag: 'woodland' }],
      },
    })

    // Product 7: Maserati Bracelet
    await payload.create({
      collection: 'products',
      data: {
        title: 'Maserati Noir Prestige Bracelet',
        slug: 'maserati-noir-prestige-bracelet',
        brand: 'Maserati',
        shortDescription: 'Braided black calfskin leather bracelet accented by gold-plated stainless steel hardware with the trident logo.',
        fullDescription: createLexicalDescription(
          'Infuse luxury automotive spirit into your wristwear. The Maserati Noir Prestige Bracelet is braided from soft black Italian calfskin leather and secured by a high-grade gold-plated stainless steel magnetic clasp, engraved with Maserati’s signature trident logo.'
        ),
        image: mediaRing.id,
        category: catAccessories.id,
        featured: true,
        specifications: [
          { key: 'Material', value: 'Italian Calfskin Leather & 316L Stainless Steel' },
          { key: 'Plating', value: '18K Yellow Gold IP Plating' },
          { key: 'Clasp Type', value: 'Magnetic Lock' },
          { key: 'Length', value: '21 cm' },
        ],
        seo: {
          title: 'Maserati Noir Prestige Bracelet - Black Leather & Gold clasp',
          description: 'Shop the Maserati Noir Prestige braided black leather bracelet with an 18k gold-plated trident clasp.',
        },
        tags: [{ tag: 'accessories' }, { tag: 'bracelet' }, { tag: 'leather' }],
      },
    })

    // Product 8: Hermes Belt
    await payload.create({
      collection: 'products',
      data: {
        title: 'Hermès Noir Executive Belt',
        slug: 'hermes-noir-executive-belt',
        brand: 'Hermès',
        shortDescription: 'Classic Hermès reversible leather belt in black Togo and brown Epsom leather, completed by the gold H buckle.',
        fullDescription: createLexicalDescription(
          'The ultimate symbol of luxury accessories. This reversible belt is crafted from black textured Togo leather on one side and smooth gold Epsom leather on the reverse. The ensemble is completed by the iconic brushed gold-plated H metal buckle, allowing versatile styling.'
        ),
        image: mediaWallet.id,
        category: catAccessories.id,
        featured: true,
        specifications: [
          { key: 'Strap Material', value: 'Togo Leather (Black) & Epsom Leather (Gold/Brown)' },
          { key: 'Buckle Material', value: 'Brushed Gold-Plated Metal' },
          { key: 'Width', value: '32 mm' },
          { key: 'Origin', value: 'Made in France' },
        ],
        seo: {
          title: 'Hermes Noir Executive Belt - Reversible Gold H Buckle',
          description: 'Explore the Hermes Noir Executive Reversible Belt with Togo leather and a brushed gold H buckle.',
        },
        tags: [{ tag: 'accessories' }, { tag: 'belt' }, { tag: 'hermes' }],
      },
    })

    console.log('Luxury catalog database seeded successfully!')
    process.exit(0)
  } catch (error: any) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seed()
