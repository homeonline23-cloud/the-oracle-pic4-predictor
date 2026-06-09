/**
 * Google Play developer profile — only 2 upload files + 1 backup.
 * Run: node scripts/build-developer-profile.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const storeDir = path.join(root, 'public', 'store');
const outDir = path.join(storeDir, 'developer-profile');
const desktopDir = path.join(os.homedir(), 'Desktop', 'Play-Developer-Profile-UPLOAD');

const KEEP = new Set([
  'UPLOAD-ICON.png',
  'UPLOAD-HEADER.jpg',
  'UPLOAD-HEADER-backup.png',
  'WHICH-FILE.txt',
  'README.txt',
]);

async function ensureSharp() {
  const p = path.join(root, 'node_modules', 'sharp', 'lib', 'index.js');
  if (!fs.existsSync(p)) execSync('npm install sharp --no-save', { cwd: root, stdio: 'inherit' });
  return (await import(pathToFileURL(p).href)).default;
}

async function ensureResvg() {
  const p = path.join(root, 'node_modules', '@resvg', 'resvg-js', 'index.js');
  if (!fs.existsSync(p)) execSync('npm install @resvg/resvg-js --no-save', { cwd: root, stdio: 'inherit' });
  const { Resvg } = await import(pathToFileURL(p).href);
  return Resvg;
}

function renderSvg(Resvg, svgPath, width) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}

function cleanFolder(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (!KEEP.has(name)) {
      fs.unlinkSync(path.join(dir, name));
    }
  }
}

async function main() {
  const sharp = await ensureSharp();
  const Resvg = await ensureResvg();
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(desktopDir, { recursive: true });
  cleanFolder(outDir);
  cleanFolder(desktopDir);

  const appIcon = path.join(storeDir, 'google-play-app-icon-512.png');
  const headerSvg = path.join(storeDir, 'developer-profile-header-minimal.svg');
  const headerRaw = renderSvg(Resvg, headerSvg, 4096);

  const files = {
    'UPLOAD-ICON.png': fs.readFileSync(appIcon),
    'UPLOAD-HEADER.jpg': await sharp(headerRaw)
      .resize(4096, 2304, { fit: 'fill' })
      .flatten({ background: '#0c1528' })
      .jpeg({ quality: 85, progressive: false, mozjpeg: false })
      .toBuffer(),
    'UPLOAD-HEADER-backup.png': await sharp(headerRaw)
      .resize(4096, 2304, { fit: 'fill' })
      .flatten({ background: '#0c1528' })
      .removeAlpha()
      .png({ force: true })
      .toBuffer(),
  };

  const guide = `WHICH FILE GOES WHERE (Google Play Developer profile)
=====================================================

ONLY USE THESE TWO:

  UPLOAD-ICON.png   -->  Developer icon box   (512 x 512)
  UPLOAD-HEADER.jpg -->  Header image box     (4096 x 2304)

If the header JPG fails, try:
  UPLOAD-HEADER-backup.png  -->  Header image box

IGNORE any other old files — they were test versions.

Steps:
1. Developer icon  -> upload UPLOAD-ICON.png
2. Header image    -> upload UPLOAD-HEADER.jpg
3. Wait for both previews
4. Save changes

Folder on PC:
  C:\\DEV\\PIC4\\public\\store\\developer-profile

Same files copied to Desktop:
  Play-Developer-Profile-UPLOAD
`;

  for (const dir of [outDir, desktopDir]) {
    for (const [name, buf] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, name), buf);
    }
    fs.writeFileSync(path.join(dir, 'WHICH-FILE.txt'), guide);
    fs.writeFileSync(path.join(dir, 'README.txt'), guide);
  }

  for (const [name, buf] of Object.entries(files)) {
    const m = await sharp(buf).metadata();
    console.log(name, `${m.width}x${m.height}`, `${Math.round(buf.length / 1024)}KB`);
  }
  console.log('Folder:', outDir);
  console.log('Desktop:', desktopDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
