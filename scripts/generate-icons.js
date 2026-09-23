import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Brand SVG with futuristic DOLOR3V crystal / microcloud core
const brandSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141724" />
      <stop offset="100%" stop-color="#07080c" />
    </radialGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="50%" stop-color="#a78bfa" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.2" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="508" height="508" x="2" y="2" rx="110" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

  <!-- Ambient Glow -->
  <circle cx="256" cy="256" r="140" fill="url(#glowGrad)" filter="url(#glow)" opacity="0.35" />

  <!-- Outer Hexagonal Frame -->
  <polygon points="256,96 384,170 384,318 256,392 128,318 128,170"
           fill="none" stroke="url(#primaryGrad)" stroke-width="8" stroke-linejoin="round" opacity="0.9" />

  <!-- Inner Geometric Prisms (D-3 Motif) -->
  <!-- Upper Left Face -->
  <polygon points="256,120 360,180 256,240 152,180"
           fill="url(#primaryGrad)" fill-opacity="0.22" stroke="url(#primaryGrad)" stroke-width="4" stroke-linejoin="round" />

  <!-- Lower Left Face -->
  <polygon points="152,180 256,240 256,360 152,300"
           fill="url(#primaryGrad)" fill-opacity="0.38" stroke="url(#primaryGrad)" stroke-width="4" stroke-linejoin="round" />

  <!-- Lower Right Face -->
  <polygon points="360,180 256,240 256,360 360,300"
           fill="url(#primaryGrad)" fill-opacity="0.5" stroke="url(#primaryGrad)" stroke-width="4" stroke-linejoin="round" />

  <!-- Center Node Core -->
  <circle cx="256" cy="240" r="14" fill="#ffffff" filter="url(#glow)" />
  <circle cx="256" cy="240" r="7" fill="#60a5fa" />

  <!-- Geometric Circuit Accents -->
  <line x1="256" y1="96" x2="256" y2="120" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" />
  <line x1="384" y1="318" x2="360" y2="300" stroke="#a78bfa" stroke-width="4" stroke-linecap="round" />
  <line x1="128" y1="318" x2="152" y2="300" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
  <line x1="256" y1="360" x2="256" y2="392" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" />
</svg>`;

// Maskable version with 15% safe padding
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="mBgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141724" />
      <stop offset="100%" stop-color="#07080c" />
    </radialGradient>
    <linearGradient id="mPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="50%" stop-color="#a78bfa" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>
  <!-- Full bleed for maskable -->
  <rect width="512" height="512" fill="url(#mBgGrad)" />
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <polygon points="256,96 384,170 384,318 256,392 128,318 128,170"
             fill="none" stroke="url(#mPrimaryGrad)" stroke-width="10" stroke-linejoin="round" />
    <polygon points="256,120 360,180 256,240 152,180"
             fill="url(#mPrimaryGrad)" fill-opacity="0.25" stroke="url(#mPrimaryGrad)" stroke-width="5" stroke-linejoin="round" />
    <polygon points="152,180 256,240 256,360 152,300"
             fill="url(#mPrimaryGrad)" fill-opacity="0.4" stroke="url(#mPrimaryGrad)" stroke-width="5" stroke-linejoin="round" />
    <polygon points="360,180 256,240 256,360 360,300"
             fill="url(#mPrimaryGrad)" fill-opacity="0.55" stroke="url(#mPrimaryGrad)" stroke-width="5" stroke-linejoin="round" />
    <circle cx="256" cy="240" r="14" fill="#ffffff" />
  </g>
</svg>`;

async function main() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), brandSvg, 'utf8');

  const svgBuffer = Buffer.from(brandSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 maskable
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // favicon 48x48 png / ico
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated all PWA icons.');
}

main().catch(console.error);
