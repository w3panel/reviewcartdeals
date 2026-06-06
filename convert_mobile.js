import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'C:\\Users\\Rahila MK\\.gemini\\antigravity-ide\\brain\\b0ce0464-3af4-4978-8559-9e20b0033817\\hero_luxury_mobile_1780550570822.png';
const outputPath = 'public/seed/hero_luxury_mobile.webp';

sharp(inputPath)
  .resize({ width: 800, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(outputPath)
  .then(() => console.log('Successfully generated mobile hero webp'))
  .catch(console.error);
