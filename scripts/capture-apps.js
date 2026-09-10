const { chromium } = require('playwright');
const { KEEP_SHOTS, ADMIN_SHOTS, LOCALE_COOKIE } = require('./shots.config.js');

const LOCALE = process.env.LOCALE || 'en';
const OUTDIR = process.env.OUTDIR || 'raw-screenshots';

function assertNoToolbar(page, name) {
  return page.evaluate((shotName) => {
    const toolbar = document.querySelector('astro-dev-toolbar');
    if (toolbar) {
      throw new Error(`astro-dev-toolbar present in ${shotName}`);
    }
  }, name);
}

const consentCookie = { name: 'stancona_consent', value: '{"v":1,"necessary":true,"preferences":false,"analytics":false,"ts":0}', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 15552000 };

(async () => {
  const browser = await chromium.launch();

  // === Keep PWA (Turkish-only UI, locale-independent — captured once) ===
  if (!process.env.SKIP_KEEP) {
    console.log('📱 Capturing Keep PWA screenshots...');
    const keepCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      locale: 'tr-TR',
    });
    await keepCtx.addCookies([consentCookie]);
    if (process.env.SHOWCASE_TOKEN) {
      await keepCtx.addInitScript((token) => {
        try { localStorage.setItem("stancona_auth_token", token); } catch { /* noop */ }
      }, process.env.SHOWCASE_TOKEN);
    }
    await keepCtx.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      const response = await route.fetch({ url: `http://localhost:3000${url.pathname}${url.search}` });
      await route.fulfill({ response });
    });
    const keepPage = await keepCtx.newPage();
    for (const p of KEEP_SHOTS) {
      const url = p.slug ? `http://localhost:3004/${p.slug}` : 'http://localhost:3004/';
      try {
        await keepPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await keepPage.waitForTimeout(1500);
        await keepPage.evaluate(() => {
          localStorage.setItem('stancona:lang-banner-dismissed', '1');
          document.querySelector('astro-dev-toolbar')?.remove();
          const kill = document.createElement('style');
          kill.textContent = '[data-reveal]{opacity:1!important;transform:none!important}*{transition:none!important;animation:none!important}';
          document.head.appendChild(kill);
          document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(el => el.classList.add('is-visible'));
        });
        await keepPage.waitForTimeout(400);
        await assertNoToolbar(keepPage, `keep-pwa/${p.name}`);
        await keepPage.screenshot({ path: `${OUTDIR}/keep-pwa/${p.name}.png`, fullPage: true });
        console.log(`  ✅ ${p.name}`);
      } catch (e) {
        console.log(`  ⚠️  ${p.name}: ${e.message}`);
      }
    }
    await keepCtx.close();
  }

  // === Admin Panel ===
  console.log('\n🛡️ Capturing admin panel screenshots...');
  const adminCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: LOCALE === 'tr' ? 'tr-TR' : 'en-US',
  });
  const adminCookies = [consentCookie];
  if (LOCALE_COOKIE[LOCALE]) {
    adminCookies.push({ name: 'stancona_locale', value: LOCALE_COOKIE[LOCALE], domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 31536000 });
  }
  if (process.env.SHOWCASE_SESSION) {
    adminCookies.push({ name: 'stancona_session', value: process.env.SHOWCASE_SESSION, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax', expires: Date.now() / 1000 + 2592000 });
  }
  await adminCtx.addCookies(adminCookies);
  const adminPage = await adminCtx.newPage();
  for (const p of ADMIN_SHOTS) {
    const url = `http://localhost:3000/${p.slug}`;
    try {
      await adminPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await adminPage.waitForTimeout(1500);
      await adminPage.evaluate(() => {
        document.querySelector('astro-dev-toolbar')?.remove();
      });
      await assertNoToolbar(adminPage, `admin-panel/${p.name} [${LOCALE}]`);
      await adminPage.screenshot({ path: `${OUTDIR}/admin-panel/${p.name}.png`, fullPage: true });
      console.log(`  ✅ ${p.name} [${LOCALE}]`);
    } catch (e) {
      console.log(`  ⚠️  ${p.name} [${LOCALE}]: ${e.message}`);
    }
  }
  await adminCtx.close();

  // === Homepage ===
  console.log('\n🏠 Capturing homepage...');
  const homeCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: LOCALE === 'tr' ? 'tr-TR' : 'en-US',
  });
  await homeCtx.addCookies([
    consentCookie,
    { name: 'stancona_locale', value: LOCALE_COOKIE[LOCALE], domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 31536000 },
  ]);
  const homePage = await homeCtx.newPage();
  try {
    const homeUrl = LOCALE === 'en' ? 'http://localhost:4321/en/' : 'http://localhost:4321/';
    await homePage.goto(homeUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await homePage.waitForTimeout(1500);
    await homePage.evaluate(() => {
      localStorage.setItem('stancona:lang-banner-dismissed', '1');
      document.querySelector('astro-dev-toolbar')?.remove();
    });
    await homePage.waitForTimeout(500);
    await homePage.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove());
    await assertNoToolbar(homePage, `homepage [${LOCALE}]`);
    await homePage.screenshot({ path: `${OUTDIR}/homepage/01-homepage-full.png`, fullPage: true });
    await homePage.screenshot({ path: `${OUTDIR}/homepage/02-hero-viewport.png` });
    console.log(`  ✅ homepage [${LOCALE}]`);
  } catch (e) {
    console.log(`  ⚠️  homepage [${LOCALE}]: ${e.message}`);
  }
  await homeCtx.close();

  await browser.close();
  console.log('\n🎉 All screenshots captured!');
})();
