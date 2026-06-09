/**
 * Capture 1080×1920 Play Store phone screenshots.
 * Run: node scripts/capture-play-screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public', 'store', 'phone-screenshots');
const live = 'https://theoraclepic4.com';

const LOGIN_EMAIL = process.env.PLAY_SCREENSHOT_EMAIL || 'homeonline23@gmail.com';
const LOGIN_PASSWORD = process.env.PLAY_SCREENSHOT_PASSWORD || 'OracleDemo2026!';

fs.mkdirSync(outDir, { recursive: true });

/** Live site has deployed UI copy; use it for store screenshots. */
const siteBase = live;
console.log('Using', siteBase);

/** Headless Chromium cannot autoplay hero video — hide the hero block only. */
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
  await page.waitForTimeout(3000);
  await hideHeroVideo(page);
}

async function tryLogin(page, site) {
  if (site.includes('localhost')) {
    const res = await page.request.post(`${site}/api/demo-login`);
    if (!res.ok()) {
      const body = await res.json().catch(() => ({}));
      console.warn('demo-login:', body.error || res.status());
    }
  }

  await page.goto(`${site}/login?next=${encodeURIComponent('/basic')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.waitForTimeout(1500);

  const email = page.locator('input[type="email"]').first();
  if (!(await email.count())) return false;

  await email.fill(LOGIN_EMAIL);
  await page.locator('input[type="password"]').first().fill(LOGIN_PASSWORD);
  await page.locator('button[type="submit"]').click();

  try {
    await page.waitForURL(
      (url) => !url.pathname.includes('/login') || url.pathname === '/basic',
      { timeout: 35000 },
    );
    await page.waitForTimeout(2000);
    return true;
  } catch {
    const errText = await page.locator('.text-red-500').first().textContent().catch(() => '');
    if (errText) console.warn('Login error on page:', errText.trim());
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

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
  isMobile: true,
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
});
const page = await context.newPage();

try {
  const patterns = await capture(
    page,
    'screen-shot-patterns-1080.png',
    `${siteBase}/visual-evidence`,
    { scrollY: 0, waitForText: 'Pattern Gallery' },
  );
  console.log('saved', patterns);

  const pricing = await capture(
    page,
    'screen-shot-pricing-1080.png',
    `${siteBase}/pricing`,
    { scrollY: 0, waitForText: 'Choose Your Advantage' },
  );
  console.log('saved', pricing);

  const process = await capture(
    page,
    'screen-shot-process-1080.png',
    `${siteBase}/how-it-works`,
    { scrollY: 0, waitForText: 'How it Works' },
  );
  console.log('saved', process);

  const loggedIn = await tryLogin(page, siteBase);
  if (loggedIn) {
    await page.goto(`${siteBase}/basic`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await waitForPageReady(page);
    await page.waitForSelector('text=Grid 1', { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(1200);
    const grids = path.join(outDir, 'screen-shot-two-grids-1080.png');
    await page.screenshot({ path: grids, fullPage: false });
    console.log('saved', grids);
  } else {
    console.warn('Login failed — saving home page instead of grids.');
    const home = await capture(page, 'screen-shot-two-grids-1080.png', `${siteBase}/`, {
      scrollY: 480,
    });
    console.log('saved', home);
  }

  for (const f of [
    'screen-shot-patterns-1080.png',
    'screen-shot-pricing-1080.png',
    'screen-shot-process-1080.png',
    'screen-shot-two-grids-1080.png',
  ]) {
    const p = path.join(outDir, f);
    if (fs.existsSync(p)) {
      const b = fs.readFileSync(p);
      const w = b.readUInt32BE(16);
      const h = b.readUInt32BE(20);
      console.log(f, `${w}x${h}`, `${Math.round(fs.statSync(p).size / 1024)}KB`);
    }
  }
} finally {
  await browser.close();
}
