/**
 * Build Indiegogo image pack from store assets + story art.
 * Run: node scripts/build-indiegogo-pack.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(root, 'public', 'indiegogo');

async function ensureSharp() {
  const sharpPath = path.join(root, 'node_modules', 'sharp', 'lib', 'index.js');
  if (!fs.existsSync(sharpPath)) {
    execSync('npm install sharp --no-save', { cwd: root, stdio: 'inherit' });
  }
  return (await import(pathToFileURL(sharpPath).href)).default;
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Cover crop: fill exact size, center. */
async function resizeCover(sharp, src, dest, w, h) {
  await sharp(src).resize(w, h, { fit: 'cover', position: 'centre' }).png({ compressionLevel: 6 }).toFile(dest);
  console.log('Wrote', path.relative(root, dest));
}

/** Gallery 16:9 from tall phone screenshot — crop top hero area. */
async function phoneToGallery(sharp, src, dest) {
  await sharp(src)
    .resize(1200, 2133, { fit: 'cover', position: 'top' })
    .extract({ left: 0, top: 0, width: 1200, height: 630 })
    .png({ compressionLevel: 6 })
    .toFile(dest);
  console.log('Wrote', path.relative(root, dest));
}

/** Square perk / avatar. */
async function resizeSquare(sharp, src, dest, size) {
  await sharp(src).resize(size, size, { fit: 'cover', position: 'centre' }).png({ compressionLevel: 6 }).toFile(dest);
  console.log('Wrote', path.relative(root, dest));
}

/** Story width 1200, height auto (max 900). */
async function storyWidth(sharp, src, dest) {
  await sharp(src)
    .resize(1200, null, { withoutEnlargement: false })
    .png({ compressionLevel: 6 })
    .toFile(dest);
  console.log('Wrote', path.relative(root, dest));
}

const readme = `INDIEGOGO IMAGE PACK — The Oracle Pic 4 Predictor
=================================================

Upload these from: C:\\DEV\\PIC4\\public\\indiegogo\\

COVER (no text on image)
  cover/cover-banner-1743x498.png     → Campaign cover (min 1743×498)

SOCIAL
  social/social-share-1200x630.png    → Facebook / X share image

AVATAR
  avatar/avatar-700x700.png           → Project avatar (700×700)

GALLERY (1200×630 each — main carousel)
  gallery/gallery-01-homepage.png
  gallery/gallery-02-patterns.png
  gallery/gallery-03-two-grids.png
  gallery/gallery-04-process.png
  gallery/gallery-05-pricing.png
  gallery/gallery-06-oracle-ai-promo.png

STORY — "My true story" section (840–1200 px wide)
  story/story-01-sleepless-night-caribbean.png
  story/story-02-building-with-ai-friend.png
  story/story-03-sixteen-block-grid-logic.png
  story/story-04-first-web-app-live.png

PERKS / REWARDS (700×700)
  perks/perk-early-supporter-700.png
  perks/perk-oracle-member-700.png
  perks/perk-lifetime-access-700.png

Tip: Use PNG files. Indiegogo compresses to WebP — start sharp at 1200px+ wide.
Regenerate resized exports: node scripts/build-indiegogo-pack.mjs
`;

async function main() {
  const sharp = await ensureSharp();
  const dirs = ['cover', 'social', 'avatar', 'gallery', 'story', 'perks'];
  for (const d of dirs) mkdirp(path.join(outRoot, d));

  const store = path.join(root, 'public', 'store');
  const phone = path.join(store, 'phone-screenshots');
  const chrome = path.join(store, 'chromebook-screenshots');

  // Avatar from app icon
  await resizeSquare(sharp, path.join(store, 'google-play-app-icon-1024.png'), path.join(outRoot, 'avatar', 'avatar-700x700.png'), 700);

  // Social + gallery from sharp screenshots
  await phoneToGallery(sharp, path.join(phone, 'screen-shot-patterns-1080.png'), path.join(outRoot, 'social', 'social-share-1200x630.png'));
  await phoneToGallery(sharp, path.join(phone, 'screen-shot-patterns-1080.png'), path.join(outRoot, 'gallery', 'gallery-02-patterns.png'));

  const galleryPhone = [
    ['gallery-01-homepage.png', 'sreen-shot-homepage-1.jpg'],
    ['gallery-03-two-grids.png', 'screen-shot-two-grids-1080.png'],
    ['gallery-04-process.png', 'screen-shot-process-1080.png'],
    ['gallery-05-pricing.png', 'screen-shot-pricing-1080.png'],
  ];
  for (const [out, src] of galleryPhone) {
    const p = path.join(phone, src);
    if (fs.existsSync(p)) await phoneToGallery(sharp, p, path.join(outRoot, 'gallery', out));
  }

  // Oracle promo for gallery
  const oracle1 = path.join(root, 'public', 'The Oracle-1.png');
  if (fs.existsSync(oracle1)) {
    await resizeCover(sharp, oracle1, path.join(outRoot, 'gallery', 'gallery-06-oracle-ai-promo.png'), 1200, 630);
  }

  // Cover: prefer text-free cinematic art; fallback to site screenshot
  const coverArt = path.join(outRoot, '_src-cover-wide.png');
  const coverSrc = fs.existsSync(coverArt)
    ? coverArt
    : fs.existsSync(path.join(chrome, 'screen-shot-homepage-1920.png'))
      ? path.join(chrome, 'screen-shot-homepage-1920.png')
      : oracle1;
  if (coverSrc && fs.existsSync(coverSrc)) {
    await resizeCover(sharp, coverSrc, path.join(outRoot, 'cover', 'cover-banner-1743x498.png'), 1743, 498);
  }

  // Story art — normalize if present (generated separately)
  const storySources = [
    ['story-01-sleepless-night-caribbean.png', path.join(outRoot, 'story-sleepless-night-caribbean-1200.png')],
    ['story-02-building-with-ai-friend.png', path.join(outRoot, '_src-story-02.png')],
    ['story-03-sixteen-block-grid-logic.png', path.join(outRoot, '_src-story-03.png')],
    ['story-04-first-web-app-live.png', path.join(outRoot, '_src-story-04.png')],
  ];
  for (const [out, src] of storySources) {
    if (fs.existsSync(src)) {
      await storyWidth(sharp, src, path.join(outRoot, 'story', out));
    }
  }

  // Perks from icons / feature graphic
  await resizeSquare(sharp, path.join(store, 'google-play-app-icon-1024.png'), path.join(outRoot, 'perks', 'perk-early-supporter-700.png'), 700);
  await resizeSquare(sharp, path.join(store, 'icon-pic4-1024.png'), path.join(outRoot, 'perks', 'perk-oracle-member-700.png'), 700);
  const feature = path.join(store, 'google-play-feature-graphic-1024x500.png');
  if (fs.existsSync(feature)) {
    await sharp(feature)
      .resize(700, 700, { fit: 'contain', background: { r: 10, g: 15, b: 30, alpha: 1 } })
      .png({ compressionLevel: 6 })
      .toFile(path.join(outRoot, 'perks', 'perk-lifetime-access-700.png'));
    console.log('Wrote', path.relative(root, path.join(outRoot, 'perks', 'perk-lifetime-access-700.png')));
  }

  fs.writeFileSync(path.join(outRoot, 'README.txt'), readme);
  console.log('Wrote public/indiegogo/README.txt');
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
