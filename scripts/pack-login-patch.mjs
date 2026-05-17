/**
 * Small zip: only login page build files (no Fast Login).
 * Upload paths must match your public_html layout — see LOGIN_SECURITY_PATCH_README.txt
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outZip = path.join(root, 'LOGIN_SECURITY_PATCH.zip');
const readme = path.join(root, 'LOGIN_SECURITY_PATCH_README.txt');

const readmeText = `LOGIN SECURITY PATCH — removes Fast Login from live site
============================================================

1. Namecheap cPanel → File Manager → public_html

2. Upload LOGIN_SECURITY_PATCH.zip into public_html

3. Extract here (merge into existing folders — overwrite when asked)

4. cPanel → Setup Node.js App → RESTART

5. Incognito: https://theoraclepic4.com/login
   Fast Login must be gone.

Files in this zip (merge into public_html):
  .next/server/app/login/
  .next/static/chunks/app/login/

If your app lives in a subfolder, extract there instead of public_html.
`;

console.log('Building…');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

const paths = [
  '.next/server/app/login',
  '.next/static/chunks/app/login',
];

for (const rel of paths) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error('Missing after build:', rel);
    process.exit(1);
  }
}

if (fs.existsSync(outZip)) fs.unlinkSync(outZip);
fs.writeFileSync(readme, readmeText);

await new Promise((resolve, reject) => {
  const output = fs.createWriteStream(outZip);
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', resolve);
  archive.on('error', reject);
  archive.pipe(output);
  for (const rel of paths) {
    archive.directory(path.join(root, rel), rel);
  }
  archive.file(readme, { name: 'LOGIN_SECURITY_PATCH_README.txt' });
  archive.finalize();
});

const mb = (fs.statSync(outZip).size / (1024 * 1024)).toFixed(2);
console.log(`Created ${outZip} (${mb} MB)`);
