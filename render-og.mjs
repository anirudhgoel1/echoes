import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('og-source.svg');
const png = await sharp(svg, { density: 200 })
  .resize(1200, 630, { fit: 'cover' })
  .png({ compressionLevel: 9 })
  .toBuffer();
writeFileSync('og.png', png);
console.log('wrote og.png', png.length, 'bytes');
