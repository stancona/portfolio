#!/bin/bash
# =============================================================================
# Stancona Portfolio — Image Processor
# =============================================================================
# Processes raw screenshots into portfolio-ready assets.
#
# Usage:
#   ./process-images.sh <input-folder> <output-folder>
#
# Requirements:
#   - ImageMagick (magick command)
#
# Output sizes:
#   - full/       → 2880x1800 (retina)
#   - thumbnail/  → 720x450 (gallery grid)
#   - og/         → 1200x630 (Open Graph / social)
# =============================================================================

set -euo pipefail

INPUT_DIR=${1:-"raw-screenshots"}
OUTPUT_DIR=${2:-"processed"}

# Stancona brand colors
GRADIENT_START="#0a0a0a"
GRADIENT_END="#1a1a2e"
SHADOW_COLOR="rgba(0,0,0,0.3)"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick not found. Install with: brew install imagemagick"
    exit 1
fi

# Check if input directory exists
if [ ! -d "$INPUT_DIR" ]; then
    echo "❌ Input directory not found: $INPUT_DIR"
    exit 1
fi

# Create output directories
mkdir -p "$OUTPUT_DIR/full" "$OUTPUT_DIR/thumbnail" "$OUTPUT_DIR/og"

# Count files
FILE_COUNT=$(ls -1 "$INPUT_DIR"/*.png 2>/dev/null | wc -l)
if [ "$FILE_COUNT" -eq 0 ]; then
    echo "❌ No PNG files found in $INPUT_DIR"
    exit 1
fi

echo "📸 Processing $FILE_COUNT screenshots from $INPUT_DIR..."
echo ""

PROCESSED=0

for img in "$INPUT_DIR"/*.png; do
    filename=$(basename "$img" .png)

    # Full retina (2880x1800)
    magick "$img" \
        -resize 2880x1800^ \
        -gravity center \
        -extent 2880x1800 \
        "$OUTPUT_DIR/full/${filename}.png"

    # Thumbnail (720x450)
    magick "$img" \
        -resize 720x450^ \
        -gravity center \
        -extent 720x450 \
        "$OUTPUT_DIR/thumbnail/${filename}.png"

    # OG image (1200x630)
    magick "$img" \
        -resize 1200x630^ \
        -gravity center \
        -extent 1200x630 \
        "$OUTPUT_DIR/og/${filename}.png"

    PROCESSED=$((PROCESSED + 1))
    echo "  ✅ [$PROCESSED/$FILE_COUNT] $filename"
done

echo ""
echo "🎉 Done! Processed $PROCESSED screenshots."
echo "   Full:      $OUTPUT_DIR/full/"
echo "   Thumbnail: $OUTPUT_DIR/thumbnail/"
echo "   OG:        $OUTPUT_DIR/og/"
