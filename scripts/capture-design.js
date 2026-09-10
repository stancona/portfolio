const { chromium } = require('playwright');
const { DESIGN_SHOTS, LOCALE_COOKIE } = require('./shots.config.js');

const LOCALE = process.env.LOCALE || 'en';
const OUTDIR = process.env.OUTDIR || 'raw-screenshots';
const PREFIX = LOCALE === 'en' ? '/en' : '';
const BASE = `http://localhost:4321${PREFIX}/design`;
const OUTPUT = `${OUTDIR}/design-system`;

function assertNoToolbar(page, name) {
  return page.evaluate((shotName) => {
    const toolbar = document.querySelector('astro-dev-toolbar');
    if (toolbar) {
      throw new Error(`astro-dev-toolbar present in ${shotName}`);
    }
  }, name);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: LOCALE === 'tr' ? 'tr-TR' : 'en-US',
  });

  await context.addCookies([
    { name: 'stancona_consent', value: '{"v":1,"necessary":true,"preferences":false,"analytics":false,"ts":0}', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 15552000 },
    { name: 'stancona_locale', value: LOCALE_COOKIE[LOCALE], domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 31536000 },
  ]);

  const page = await context.newPage();

  for (const p of DESIGN_SHOTS) {
    const url = p.slug ? `${BASE}/${p.slug}` : BASE;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      await page.evaluate(() => {
        localStorage.setItem('stancona:lang-banner-dismissed', '1');
        document.querySelectorAll('[class*="consent"], [class*="cookie"]').forEach(el => el.remove());
        document.querySelectorAll('[class*="language-banner"]').forEach(el => el.remove());
        document.querySelector('astro-dev-toolbar')?.remove();
      });
      await page.waitForTimeout(500);
      await page.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove());
      await assertNoToolbar(page, `design-system/${p.name} [${LOCALE}]`);
      await page.screenshot({ path: `${OUTPUT}/${p.name}.png`, fullPage: true });
      console.log(`✅ ${p.name} [${LOCALE}]`);
    } catch (e) {
      console.log(`⚠️  ${p.name} [${LOCALE}]: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\n🎉 Done! ${DESIGN_SHOTS.length} screenshots captured (${LOCALE}).`);
})();
