const { chromium } = require('playwright');

const KEEP_PAGES = [
  { slug: '', name: '01-home' },
  { slug: 'events', name: '02-events' },
  { slug: 'tickets', name: '03-tickets-qr' },
  { slug: 'league', name: '04-league' },
  { slug: 'profile', name: '05-profile' },
];

const ADMIN_PAGES = [
  { slug: '', name: '01-dashboard' },
  { slug: 'login', name: '02-login' },
  { slug: 'admin/ui-lab', name: '03-ui-lab' },
];

(async () => {
  const browser = await chromium.launch();

  // === Keep PWA ===
  console.log('📱 Capturing Keep PWA screenshots...');
  const keepCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: 'en-US',
  });
  await keepCtx.addCookies([
    { name: 'stancona_consent', value: '{"v":1,"necessary":true,"preferences":false,"analytics":false,"ts":0}', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 15552000 },
    { name: 'stancona_locale', value: 'ZW4=', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 31536000 },
  ]);
  const keepPage = await keepCtx.newPage();
  for (const p of KEEP_PAGES) {
    const url = p.slug ? `http://localhost:3004/${p.slug}` : 'http://localhost:3004/';
    try {
      await keepPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await keepPage.waitForTimeout(1500);
      await keepPage.evaluate(() => {
        localStorage.setItem('stancona:lang-banner-dismissed', '1');
        localStorage.setItem('astro-dev-toolbar-visible', 'false');
      });
      await keepPage.screenshot({ path: `raw-screenshots/keep-pwa/${p.name}.png`, fullPage: true });
      console.log(`  ✅ ${p.name}`);
    } catch (e) {
      console.log(`  ⚠️  ${p.name}: ${e.message}`);
    }
  }
  await keepCtx.close();

  // === Admin Panel ===
  console.log('\n🛡️ Capturing admin panel screenshots...');
  const adminCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'en-US',
  });
  await adminCtx.addCookies([
    { name: 'stancona_consent', value: '{"v":1,"necessary":true,"preferences":false,"analytics":false,"ts":0}', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 15552000 },
  ]);
  const adminPage = await adminCtx.newPage();
  for (const p of ADMIN_PAGES) {
    const url = p.slug ? `http://localhost:3000/${p.slug}` : 'http://localhost:3000/';
    try {
      await adminPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await adminPage.waitForTimeout(1500);
      await adminPage.evaluate(() => {
        localStorage.setItem('astro-dev-toolbar-visible', 'false');
      });
      await adminPage.screenshot({ path: `raw-screenshots/admin-panel/${p.name}.png`, fullPage: true });
      console.log(`  ✅ ${p.name}`);
    } catch (e) {
      console.log(`  ⚠️  ${p.name}: ${e.message}`);
    }
  }
  await adminCtx.close();

  // === Homepage ===
  console.log('\n🏠 Capturing homepage...');
  const homeCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'en-US',
  });
  await homeCtx.addCookies([
    { name: 'stancona_consent', value: '{"v":1,"necessary":true,"preferences":false,"analytics":false,"ts":0}', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 15552000 },
    { name: 'stancona_locale', value: 'ZW4=', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 31536000 },
  ]);
  const homePage = await homeCtx.newPage();
  try {
    await homePage.goto('http://localhost:4321/en/', { waitUntil: 'networkidle', timeout: 15000 });
    await homePage.waitForTimeout(1500);
    await homePage.evaluate(() => {
      localStorage.setItem('stancona:lang-banner-dismissed', '1');
      localStorage.setItem('astro-dev-toolbar-visible', 'false');
    });
    await homePage.waitForTimeout(500);
    await homePage.screenshot({ path: 'raw-screenshots/homepage/01-homepage-full.png', fullPage: true });
    await homePage.screenshot({ path: 'raw-screenshots/homepage/02-hero-viewport.png' });
    console.log('  ✅ homepage');
  } catch (e) {
    console.log(`  ⚠️  homepage: ${e.message}`);
  }
  await homeCtx.close();

  await browser.close();
  console.log('\n🎉 All screenshots captured!');
})();
