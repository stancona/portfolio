#!/bin/bash
# =============================================================================
# Stancona Portfolio — Design System Screenshot Capture (Fixed)
# =============================================================================
# Captures clean English screenshots with cookie consent and language banner hidden.
#
# Usage:
#   ./capture-design-system-fixed.sh
#
# Prerequisites:
#   - Grimoire dev server running on localhost:4321
#   - Playwright installed
# =============================================================================

set -euo pipefail

BASE_URL="http://localhost:4321/en/design"
OUTPUT_DIR="raw-screenshots/design-system"

# Design system pages to capture
PAGES=(
  ""
  "brand"
  "colors"
  "typography"
  "icons"
  "button"
  "dropdown"
  "fab"
  "modal"
  "card"
  "table"
  "badge"
  "alert"
  "toast"
  "tooltip"
  "hero"
  "accordion"
  "navbar"
  "tab"
  "steps"
)

# Page names for file naming
NAMES=(
  "01-overview"
  "02-brand-logo"
  "03-colors-theme"
  "04-typography"
  "05-icons-spacing"
  "06-button-variants"
  "07-dropdown"
  "08-fab-speed-dial"
  "09-modal-dialog"
  "10-card-examples"
  "11-table-data"
  "12-badge-variants"
  "13-alert-feedback"
  "14-toast-notification"
  "15-tooltip"
  "16-hero-cta"
  "17-accordion"
  "18-navbar"
  "19-tab-navigation"
  "20-steps-wizard"
)

echo "📸 Capturing design system screenshots (English, clean)..."
echo "   Base URL: $BASE_URL"
echo "   Output: $OUTPUT_DIR"
echo ""

mkdir -p "$OUTPUT_DIR"

# Create a temporary Playwright script to set cookies before capture
cat > /tmp/capture-with-cookies.js << 'SCRIPT'
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'en-US',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  // Set cookies to hide consent and language banners
  await context.addCookies([
    {
      name: 'stancona_consent',
      value: '{"v":1,"necessary":true,"preferences":false,"analytics":false,"ts":0}',
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 15552000
    },
    {
      name: 'stancona_locale',
      value: 'ZW4=',
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 31536000
    }
  ]);

  const page = await context.newPage();

  // Read URLs from stdin
  const urls = JSON.parse(process.argv[2] || '[]');
  const outputDir = process.argv[3] || '.';

  for (const { url, name } of urls) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);

      // Dismiss language banner if it appears
      await page.evaluate(() => {
        localStorage.setItem('stancona:lang-banner-dismissed', '1');
      });

      // Wait for any animations
      await page.waitForTimeout(500);

      await page.screenshot({
        path: `${outputDir}/${name}.png`,
        fullPage: true
      });
      console.log(`  ✅ ${name}`);
    } catch (e) {
      console.log(`  ⚠️  Failed: ${name} — ${e.message}`);
    }
  }

  await browser.close();
})();
SCRIPT

# Build URL list
URL_LIST="[]"
for i in "${!PAGES[@]}"; do
  slug="${PAGES[$i]}"
  name="${NAMES[$i]}"

  if [ -z "$slug" ]; then
    url="$BASE_URL"
  else
    url="$BASE_URL/$slug"
  fi

  URL_LIST=$(echo "$URL_LIST" | python3 -c "
import sys, json
data = json.load(sys.stdin)
data.append({'url': '$url', 'name': '$name'})
json.dump(data, sys.stdout)
")
done

# Run the capture
node /tmp/capture-with-cookies.js "$URL_LIST" "$OUTPUT_DIR"

echo ""
echo "✅ Done! Screenshots saved to $OUTPUT_DIR/"
echo "   Total: $(ls -1 $OUTPUT_DIR/*.png 2>/dev/null | wc -l) screenshots"
