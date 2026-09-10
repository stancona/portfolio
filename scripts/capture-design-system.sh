#!/bin/bash
# =============================================================================
# Stancona Portfolio — Design System Screenshot Capture
# =============================================================================
# Uses Playwright to capture screenshots from the live Astro dev server.
#
# Usage:
#   ./capture-design-system.sh
#
# Prerequisites:
#   - Grimoire dev server running on localhost:4321
#   - Playwright installed (npx playwright install chromium)
# =============================================================================

set -euo pipefail

BASE_URL="http://localhost:4321/design"
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

echo "📸 Capturing design system screenshots..."
echo "   Base URL: $BASE_URL"
echo "   Output: $OUTPUT_DIR"
echo ""

mkdir -p "$OUTPUT_DIR"

for i in "${!PAGES[@]}"; do
  slug="${PAGES[$i]}"
  name="${NAMES[$i]}"

  if [ -z "$slug" ]; then
    url="$BASE_URL"
  else
    url="$BASE_URL/$slug"
  fi

  echo "  [$((i+1))/${#PAGES[@]}] $name → $url"

  # Use Playwright to capture full page screenshot
  npx playwright screenshot \
    --full-page \
    --viewport-size="1440,900" \
    --wait-for-timeout=2000 \
    "$url" \
    "$OUTPUT_DIR/${name}.png" 2>/dev/null || echo "    ⚠️  Failed to capture $name"
done

echo ""
echo "✅ Done! Screenshots saved to $OUTPUT_DIR/"
echo "   Total: $(ls -1 $OUTPUT_DIR/*.png 2>/dev/null | wc -l) screenshots"
