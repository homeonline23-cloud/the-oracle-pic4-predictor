/**
 * Capture 1920×1080 (16:9) Android XR store screenshots.
 * Play requires 4–8 images, 16:9 or 9:16, each side 720–7680 px, ≤15 MB.
 * Run: node scripts/capture-android-xr-screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public', 'store', 'android-xr-screenshots');
const siteBase = 'https://theoraclepic4.com';

const LOGIN_EMAIL = process.env.PLAY_SCREENSHOT_EMAIL || 'homeonline23@gmail.com';
const LOGIN_PASSWORD = process.env.PLAY_SCREENSHOT_PASSWORD || 'OracleDemo2026!';

const WIDTH = 1920;
const HEIGHT = 1080;

fs.mkdirSync(outDir, { recursive: true });
console.log('Using', siteBase, `viewport ${WIDTH}x${HEIGHT} (16:9)`);

async function hideHeroVideo(page) {
  await page.addStyleTag({
    content: `
      video,
      [class*="aspect-video"] {
        display: none !important;
      }
    `,
  });
}

async function waitForPageReady(page) {
  await page.waitForLoadState('networkidle', { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await hideHeroVideo(page);
}

async function tryLogin(page) {
  await page.goto(`${siteBase}/login?next=${encodeURIComponent('/basic')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.waitForTimeout(1500);

  await page.fill('input[type="email"]', LOGIN_EMAIL);
  await page.fill('input[type="password"]', LOGIN_PASSWORD);
  await page.locator('button[type="submit"]').click();

  try {
    await page.waitForURL(
      (url) => !url.pathname.includes('/login') || url.pathname === '/basic',
      { timeout: 35000 },
    );
    await page.waitForTimeout(2000);
    return true;
  } catch {
    return false;
  }
}

async function capture(page, name, url, { scrollY = 0, waitForText } = {}) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await waitForPageReady(page);
  if (waitForText) {
    await page.getByText(waitForText, { exact: false }).first().waitFor({ timeout: 30000 });
  }
  if (scrollY > 0) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(800);
  }
  const file = path.join(outDir, name);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

function logDimensions(files) {
  for (const f of files) {
    const p = path.join(outDir, f);
    if (!fs.existsSync(p)) continue;
    const b = fs.readFileSync(p);
    const w = b.readUInt32BE(16);
    const h = b.readUInt32BE(20);
    console.log(f, `${w}x${h}`, `${Math.round(fs.statSync(p).size / 1024)}KB`);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  userAgent:
    'Mozilla/5.0 (Linux; Android 14; XR) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
const page = await context.newPage();

const fileNames = [];

try {
  const shots = [
    { file: 'screen-shot-homepage-xr.png', url: '/', scrollY: 120, waitForText: 'Welcome' },
    {
      file: 'screen-shot-process-xr.png',
      url: '/how-it-works',
      scrollY: 0,
      waitForText: 'Operation System Core Operations',
    },
    {
      file: 'screen-shot-patterns-xr.png',
      url: '/visual-evidence',
      scrollY: 0,
      waitForText: 'Pattern Gallery',
    },
    {
      file: 'screen-shot-pricing-xr.png',
      url: '/pricing',
      scrollY: 0,
      waitForText: 'Choose Your Advantage',
    },
  ];

  for (const shot of shots) {
    const saved = await capture(page, shot.file, `${siteBase}${shot.url}`, shot);
    fileNames.push(shot.file);
    console.log('saved', saved);
  }

  const loggedIn = await tryLogin(page);
  if (loggedIn) {
    await page.goto(`${siteBase}/basic`, { waitUntil: 'networkidle', timeout: 90000 });
    await waitForPageReady(page);
    await page.waitForSelector('text=Grid 1', { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 180));
    await page.waitForTimeout(1000);
    const grids = path.join(outDir, 'screen-shot-two-grids-xr.png');
    await page.screenshot({ path: grids, fullPage: false });
    fileNames.push('screen-shot-two-grids-xr.png');
    console.log('saved', grids);
  } else {
    console.warn('Login failed — skipping grids capture.');
  }

  logDimensions(fileNames);
} finally {
  await browser.close();
}
