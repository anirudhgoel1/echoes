import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

// Echoes icon · Spotify-style green disc with a stylized "E" in negative space.
// Maskable version inflates the safe-area inset so the mark fits inside the
// inner 80% of the square (Android requires this for maskable icons).
const iconSvg = (size, isMaskable = false) => {
  const pad = isMaskable ? size * 0.10 : 0;
  const inner = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = inner / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${isMaskable ? '#0a0a0a' : 'none'}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1db954"/>
    <!-- E with serifs · subtracted via mask -->
    <g fill="#0a0a0a" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="500" font-size="${inner * 0.7}" text-anchor="middle">
      <text x="${cx}" y="${cy + inner * 0.24}">E</text>
    </g>
  </svg>`;
};

async function render(svgStr, outPath, size) {
  const buf = await sharp(Buffer.from(svgStr), { density: 200 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(outPath, buf);
  console.log(`wrote ${outPath} (${buf.length} bytes)`);
}

await render(iconSvg(192),             'icon-192.png',        192);
await render(iconSvg(512),             'icon-512.png',        512);
await render(iconSvg(512, true),       'icon-maskable.png',   512);
await render(iconSvg(180),             'apple-touch-icon.png',180);
