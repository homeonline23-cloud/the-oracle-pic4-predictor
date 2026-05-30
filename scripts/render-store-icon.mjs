/**
 * Renders logo SVGs to crisp PNGs for Google Play, site favicon, and video overlays.
 * Run: npm run store-icon
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const storeDir = path.join(root, 'public', 'store');
const publicDir = path.join(root, 'public');

const variants = [
  { svg: 'icon-pic4.svg', prefix: 'icon-pic4' },
  { svg: 'icon-pic4-transparent.svg', prefix: 'logo-pic4-overlay' },
];

async function renderWithResvg() {
  const resvgPath = path.join(root, 'node_modules', '@resvg', 'resvg-js', 'index.js');
  if (!fs.existsSync(resvgPath)) {
    execSync('npm install @resvg/resvg-js --no-save', { cwd: root, stdio: 'inherit' });
  }
  const { Resvg } = await import(pathToFileURL(resvgPath).href);

  for (const { svg, prefix } of variants) {
    const svgPath = path.join(storeDir, svg);
    const svgText = fs.readFileSync(svgPath, 'utf8');

    for (const size of [512, 1024]) {
      const resvg = new Resvg(svgText, {
        fitTo: { mode: 'width', value: size },
      });
      const png = resvg.render().asPng();
      const out = path.join(storeDir, `${prefix}-${size}.png`);
      fs.writeFileSync(out, png);
      console.log('Wrote', out);
    }
  }

  fs.copyFileSync(path.join(storeDir, 'icon-pic4-512.png'), path.join(publicDir, 'logo-pic4-modified.png'));
  fs.copyFileSync(path.join(storeDir, 'icon-pic4-512.png'), path.join(storeDir, 'google-play-app-icon-512.png'));
  fs.copyFileSync(path.join(storeDir, 'icon-pic4-1024.png'), path.join(storeDir, 'google-play-app-icon-1024.png'));
  fs.copyFileSync(
    path.join(storeDir, 'logo-pic4-overlay-1024.png'),
    path.join(publicDir, 'logo-pic4-video-overlay.png'),
  );

  const featureSvgPath = path.join(storeDir, 'google-play-feature-graphic.svg');
  if (fs.existsSync(featureSvgPath)) {
    const globePath = path.join(storeDir, 'world-globe.png');
    const globePublic = path.join(publicDir, 'world-globe.png');
    if (fs.existsSync(globePath)) {
      fs.copyFileSync(globePath, globePublic);
    }
    let featureSvg = fs.readFileSync(featureSvgPath, 'utf8');
    if (fs.existsSync(globePath)) {
      const globeB64 = fs.readFileSync(globePath).toString('base64');
      featureSvg = featureSvg.replace(
        '{{GLOBE_DATA_URI}}',
        `data:image/png;base64,${globeB64}`,
      );
    }
    const featureResvg = new Resvg(featureSvg, {
      fitTo: { mode: 'width', value: 1024 },
    });
    const featureOut = path.join(storeDir, 'google-play-feature-graphic-1024x500.png');
    fs.writeFileSync(featureOut, featureResvg.render().asPng());
    console.log('Wrote', featureOut);
  }

  console.log('Wrote public/logo-pic4-modified.png');
  console.log('Wrote public/logo-pic4-video-overlay.png (use in CapCut / Premiere)');
}

renderWithResvg().catch((err) => {
  console.error(err);
  process.exit(1);
});
