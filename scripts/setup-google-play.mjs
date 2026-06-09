/**
 * Google Play setup helper — prints your checklist after Capacitor init.
 * Run: npm run android:setup
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = path.join(root, 'android');

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

console.log('\n=== The Oracle Pic 4 — Google Play setup ===\n');

if (!fs.existsSync(path.join(root, 'node_modules', '@capacitor', 'android'))) {
  console.log('Installing Capacitor Android…');
  run('npm install @capacitor/core @capacitor/cli @capacitor/android --save');
}

if (!fs.existsSync(androidDir)) {
  console.log('Creating Android project…');
  run('npx cap add android');
} else {
  console.log('Android folder exists — syncing…');
}

run('npx cap sync android');

console.log(`
DONE (project files). Your turn in Google Play Console:

1) ONE-TIME €25 DEVELOPER FEE (to Google — not your members)
   https://play.google.com/console/signup
   Pay once → you can publish apps forever on this account.

2) CREATE APP
   - App name: The Oracle Pic 4
   - Package: com.theoraclepic4.app (must match capacitor.config.ts)
   - Free app recommended (members pay on website via Stripe)
   OR set "Paid app" €25 in Store settings if you want charge to DOWNLOAD.

3) BUILD SIGNED AAB (on your PC)
   npm run android:open
   Android Studio → Build → Generate Signed Bundle / APK → AAB
   Upload AAB to Play Console → Production / Internal testing

4) DOMAIN VERIFICATION (Trusted Web App — optional fullscreen)
   After you create signing key, copy SHA-256 fingerprint.
   Edit public/.well-known/assetlinks.json on your site (deploy to Vercel).
   Vercel must serve: https://theoraclepic4.com/.well-known/assetlinks.json

5) STORE LISTING
   Screenshots, description, privacy policy URL, content rating questionnaire.

Payments: Keep subscriptions on theoraclepic4.com (Stripe).
Google Play €25 is normally the developer registration, not member access.

Open Android Studio: npm run android:open
`);
