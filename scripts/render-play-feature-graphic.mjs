import sharp from 'sharp';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const WIDTH = 1024;
const HEIGHT = 500;

const sources = [
  join(
    root,
    'assets',
    'The-Oracle-Pic-4-predictor-Good-a59e72f0-5807-4788-81cc-bfd9d73f715e.png',
  ),
  join(
    process.env.USERPROFILE ?? '',
    '.cursor',
    'projects',
    'c-DEV-PIC4',
    'assets',
    'c__Users_Gebruiker_AppData_Roaming_Cursor_User_workspaceStorage_c3202a1ecc1234d068863114820658c9_images_The-Oracle-Pic-4-predictor-Good-a59e72f0-5807-4788-81cc-bfd9d73f715e.png',
  ),
  join(root, 'public', 'store', 'google-play-feature-graphic.svg'),
];

const source = sources.find((p) => existsSync(p));
if (!source) {
  console.error('No feature graphic source found.');
  process.exit(1);
}

const outputs = [
  join(root, 'public', 'store', 'chromebook-screenshots', 'google-play-feature-graphic-1024x500.png'),
  join(root, 'public', 'store', 'google-play-feature-graphic-1024x500.png'),
];

let pipeline = sharp(source);
if (source.endsWith('.svg')) {
  pipeline = pipeline.resize(WIDTH, HEIGHT, { fit: 'fill' });
} else {
  pipeline = pipeline.resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' });
}

const buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
const meta = await sharp(buffer).metadata();

for (const out of outputs) {
  await sharp(buffer).toFile(out);
  console.log(`Wrote ${out} (${meta.width}x${meta.height})`);
}
