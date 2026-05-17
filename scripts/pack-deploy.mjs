/**
 * Build + pack Next.js standalone for Namecheap Node.js upload.
 * Output: NODE_DEPLOY_DISC.zip in project root
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const standalone = path.join(root, '.next', 'standalone');
const outZip = path.join(root, 'NODE_DEPLOY_DISC.zip');

function copyDir(src, dest) {
  fs.cpSync(src, dest, { recursive: true });
}

console.log('Building production…');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

if (!fs.existsSync(standalone)) {
  console.error('Missing .next/standalone — check next.config.js output: standalone');
  process.exit(1);
}

console.log('Copying public + static into standalone…');
copyDir(path.join(root, 'public'), path.join(standalone, 'public'));
copyDir(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'));

// Namecheap docs reference app.js — alias for server.js
const serverJs = path.join(standalone, 'server.js');
const appJs = path.join(standalone, 'app.js');
if (fs.existsSync(serverJs) && !fs.existsSync(appJs)) {
  fs.copyFileSync(serverJs, appJs);
}

if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

console.log('Creating zip…');
await new Promise((resolve, reject) => {
  const output = fs.createWriteStream(outZip);
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', resolve);
  archive.on('error', reject);
  archive.pipe(output);
  archive.directory(standalone, false);
  archive.finalize();
});

const mb = (fs.statSync(outZip).size / (1024 * 1024)).toFixed(1);
console.log(`Done: ${outZip} (${mb} MB)`);
