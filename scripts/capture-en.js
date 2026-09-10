const { chromium } = require('playwright');

const PAGES = [
  { slug: '', name: '01-overview' },
  { slug: 'brand', name: '02-brand-logo' },
  { slug: 'colors', name: '03-colors-theme' },
  { slug: 'typography', name: '04-typography' },
  { slug: 'icons', name: '05-icons-spacing' },
  { slug: 'button', name: '06-button-variants' },
  { slug: 'dropdown', name: '07-dropdown' },
  { slug: 'fab', name: '08-fab-speed-dial' },
  { slug: 'modal', name: '09-modal-dialog' },
  { slug: 'card', name: '10-card-examples' },
  { slug: 'table', name: '11-table-data' },
  { slug: 'badge', name: '12-badge-variants' },
  { slug: 'alert', name: '13-alert-feedback' },
  { slug: 'toast', name: '14-toast-notification' },
  { slug: 'tooltip', name: '15-tooltip' },
  { slug: 'hero', name: '16-hero-cta' },
  { slug: 'accordion', name: '17-accordion' },
  { slug: 'navbar', name: '18-navbar' },
  { slug: 'tab', name: '19-tab-navigation' },
  { slug: 'steps', name: '20-steps-wizard' },
];

const BASE = 'http://localhost:4321/en/design';
const OUTPUT = 'raw-screenshots/design-system';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'en-US',
  });

  // Hide cookie consent + language banner
  await context.addCookies([
    { name: 'stancona_consent', value: '{"v":1,"necessary":true,"preferences":false,"analytics":false,"ts":0}', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 15552000 },
    { name: 'stancona_locale', value: 'ZW4=', domain: 'localhost', path: '/', sameSite: 'Lax', expires: Date.now() / 1000 + 31536000 },
  ]);

  const page = await context.newPage();

  for (const p of PAGES) {
    const url = p.slug ? `${BASE}/${p.slug}` : BASE;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      // Force dismiss any remaining banners
      await page.evaluate(() => {
        localStorage.setItem('stancona:lang-banner-dismissed', '1');
        document.querySelectorAll('[class*="consent"], [class*="cookie"]').forEach(el => el.remove());
        document.querySelectorAll('[class*="language-banner"]').forEach(el => el.remove());
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUTPUT}/${p.name}.png`, fullPage: true });
      console.log(`✅ ${p.name}`);
    } catch (e) {
      console.log(`⚠️  ${p.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\n🎉 Done! ${PAGES.length} screenshots captured.`);
})();
