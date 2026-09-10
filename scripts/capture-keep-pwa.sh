#!/bin/bash
# =============================================================================
# Stancona Portfolio — Keep PWA Screenshot Capture
# =============================================================================

set -euo pipefail

BASE_URL="http://localhost:3005"
OUTPUT_DIR="raw-screenshots/keep-pwa"

PAGES=(
  ""
  "events"
  "tickets"
  "league"
  "profile"
)

NAMES=(
  "01-home"
  "02-events"
  "03-tickets-qr"
  "04-league"
  "05-profile"
)

echo "📸 Capturing Keep PWA screenshots..."
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

  npx playwright screenshot \
    --full-page \
    --viewport-size="390,844" \
    --wait-for-timeout=2000 \
    "$url" \
    "$OUTPUT_DIR/${name}.png" 2>/dev/null || echo "    ⚠️  Failed to capture $name"
done

echo ""
echo "✅ Done! Screenshots saved to $OUTPUT_DIR/"
echo "   Total: $(ls -1 $OUTPUT_DIR/*.png 2>/dev/null | wc -l) screenshots"
