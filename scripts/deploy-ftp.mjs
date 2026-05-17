/**
 * Upload NODE_DEPLOY_DISC.zip to Namecheap via FTP (reads FTP_* from .env.local).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'basic-ftp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env.local');
const zipPath = path.join(root, 'NODE_DEPLOY_DISC.zip');

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv(envPath);
const host = env.FTP_HOST;
const user = env.FTP_USER;
const password = env.FTP_PASSWORD;
const secure = env.FTP_SECURE === 'true';

if (!host || !user || !password) {
  console.error('Missing FTP_HOST, FTP_USER, or FTP_PASSWORD in .env.local');
  process.exit(1);
}

if (!fs.existsSync(zipPath)) {
  console.error('Run: node scripts/pack-deploy.mjs first');
  process.exit(1);
}

const client = new Client(300_000);
client.ftp.verbose = false;

try {
  await client.access({
    host,
    user,
    password,
    secure,
    secureOptions: secure ? { rejectUnauthorized: false } : undefined,
  });
  await client.cd('/public_html');
  console.log('Uploading NODE_DEPLOY_DISC.zip to public_html…');
  await client.uploadFrom(zipPath, 'NODE_DEPLOY_DISC.zip');
  console.log('Upload complete.');
  console.log('');
  console.log('Next steps in cPanel:');
  console.log('  1. File Manager → public_html → Extract NODE_DEPLOY_DISC.zip');
  console.log('  2. Setup Node.js App → Restart');
} catch (err) {
  console.error('FTP failed:', err.message);
  process.exit(1);
} finally {
  client.close();
}
