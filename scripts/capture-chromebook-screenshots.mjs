/**
 * Capture 1920×1080 (16:9) tablet / Chromebook store screenshots.
 * Homepage shows hero + grid buttons (like the Oracle Pic 4 promo), not the Welcome block.
 * Run: node scripts/capture-chromebook-screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public', 'store', 'chromebook-screenshots');
const siteBase = process.env.SCREENSHOT_BASE_URL || 'https://theoraclepic4.com';

const LOGIN_EMAIL = process.env.PLAY_SCREENSHOT_EMAIL || 'homeonline23@gmail.com';
const LOGIN_PASSWORD = process.env.PLAY_SCREENSHOT_PASSWORD || 'OracleDemo2026!';

const WIDTH = 1920;
const HEIGHT = 1080;

fs.mkdirSync(outDir, { recursive: true });
console.log('Using', siteBase, `tablet viewport ${WIDTH}x${HEIGHT}`);

/** Hide hero video on inner pages only (patterns, pricing, etc.). */
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

/** Homepage: keep storm-cloud video, hide Welcome section below grid buttons. */
async function prepareHomepage(page) {
  await page.evaluate(() => {
    const stack = document.querySelector('main > div');
    if (stack?.children?.length) {
      for (let i = 2; i < stack.children.length; i += 1) {
        stack.children[i].style.setProperty('display', 'none', 'important');
      }
    }
    document.querySelector('footer')?.style.setProperty('display', 'none', 'important');
  });
}

async function waitForPageReady(page, { hideVideo = true } = {}) {
  await page.waitForLoadState('networkidle', { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(3000);
  if (hideVideo) await hideHeroVideo(page);
}

async function waitForHeroVideo(page) {
  await page.waitForSelector('video', { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => {
    const v = document.querySelector('video');
    if (v) {
      v.muted = true;
      void v.play().catch(() => {});
    }
  });
  await page.waitForTimeout(4000);
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

async function capture(page, name, url, { scrollY = 0, waitForText, homepage = false } = {}) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  if (homepage) {
    await waitForHeroVideo(page);
    await prepareHomepage(page);
  } else {
    await waitForPageReady(page, { hideVideo: true });
  }
  if (waitForText) {
    await page.getByText(waitForText, { exact: false }).first().waitFor({ timeout: 30000 });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
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
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
const page = await context.newPage();

const outputs = [];

try {
  outputs.push(
    await capture(page, 'screen-shot-homepage-1920.png', `${siteBase}/`, {
      scrollY: 0,
      waitForText: '4 Grids Boxes',
      homepage: true,
    }),
  );
  console.log('saved', outputs.at(-1));

  outputs.push(
    await capture(page, 'screen-shot-process-1920.png', `${siteBase}/how-it-works`, {
      scrollY: 0,
      waitForText: 'Operation System Core Operations',
    }),
  );
  console.log('saved', outputs.at(-1));

  outputs.push(
    await capture(page, 'screen-shot-patterns-1920.png', `${siteBase}/visual-evidence`, {
      scrollY: 0,
      waitForText: 'Pattern Gallery',
    }),
  );
  console.log('saved', outputs.at(-1));

  outputs.push(
    await capture(page, 'screen-shot-pricing-1920.png', `${siteBase}/pricing`, {
      scrollY: 0,
      waitForText: 'Choose Your Advantage',
    }),
  );
  console.log('saved', outputs.at(-1));

  const loggedIn = await tryLogin(page);
  if (loggedIn) {
    await page.goto(`${siteBase}/basic`, { waitUntil: 'networkidle', timeout: 90000 });
    await waitForPageReady(page, { hideVideo: true });
    await page.waitForSelector('text=Grid 1', { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 120));
    await page.waitForTimeout(1000);
    const grids = path.join(outDir, 'screen-shot-two-grids-1920.png');
    await page.screenshot({ path: grids, fullPage: false });
    outputs.push(grids);
    console.log('saved', grids);
  } else {
    console.warn('Login failed — skipping grids capture.');
  }

  logDimensions(outputs.map((p) => path.basename(p)));
} finally {
  await browser.close();
}
