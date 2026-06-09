/**
 * Render sharp 700×700 Indiegogo project thumbnail from SVG.
 * Run: node scripts/render-indiegogo-thumbnail.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const storeDir = path.join(root, 'public', 'store');
const outDir = path.join(root, 'public', 'indiegogo');
const avatarDir = path.join(outDir, 'avatar');

async function main() {
  const resvgPath = path.join(root, 'node_modules', '@resvg', 'resvg-js', 'index.js');
  if (!fs.existsSync(resvgPath)) {
    execSync('npm install @resvg/resvg-js --no-save', { cwd: root, stdio: 'inherit' });
  }
  const { Resvg } = await import(pathToFileURL(resvgPath).href);

  fs.mkdirSync(avatarDir, { recursive: true });

  let svg = fs.readFileSync(path.join(storeDir, 'indiegogo-thumbnail-700.svg'), 'utf8');
  const globePath = path.join(storeDir, 'world-globe.png');
  if (fs.existsSync(globePath)) {
    const globeB64 = fs.readFileSync(globePath).toString('base64');
    svg = svg.replace('{{GLOBE_DATA_URI}}', `data:image/png;base64,${globeB64}`);
  }

  for (const size of [700, 1400]) {
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
    const png = resvg.render().asPng();
    const suffix = size === 700 ? '700x700' : '1400x1400';
    const out = path.join(avatarDir, `thumbnail-oracle-pic4-${suffix}.png`);
    fs.writeFileSync(out, png);
    console.log('Wrote', out);
  }

  // Default avatar slot name
  fs.copyFileSync(
    path.join(avatarDir, 'thumbnail-oracle-pic4-700x700.png'),
    path.join(avatarDir, 'avatar-700x700.png'),
  );
  console.log('Updated avatar/avatar-700x700.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
