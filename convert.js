import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

let k
const dir = path.join(process.cwd(), 'public/seed')
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))

async function convert() {
  for (const file of files) {
    const inputPath = path.join(dir, file)
    const ext = path.extname(file)
    const base = path.basename(file, ext)
    const outputPath = path.join(dir, `${base}.webp`)
    
    // Resize parameters based on filename
    let width = 800
    if (base.includes('hero')) {
      width = 1920
    }

    console.log(`Converting ${file} to ${base}.webp (width: ${width})...`)
    
    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath)
      
    // Remove old file
    fs.unlinkSync(inputPath)
    console.log(`Done for ${file}.`)
  }
}

convert().catch(console.error)
