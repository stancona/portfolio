#!/bin/bash
# =============================================================================
# Stancona Portfolio — Sanitize Checklist
# =============================================================================
# Checks for sensitive data in screenshot filenames and README references.
# Run before any commit containing screenshots or demo data.
#
# Usage:
#   ./sanitize-checklist.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "🔍 Stancona Portfolio — Sanitize Checklist"
echo "==========================================="
echo ""

# Check 1: No .env files
echo "📋 Check 1: .env files"
if find . -name ".env*" -not -path "./.git/*" | grep -q .; then
    echo -e "   ${RED}❌ FAIL: .env files found in repo${NC}"
    find . -name ".env*" -not -path "./.git/*" | while read f; do echo "     → $f"; done
    ERRORS=$((ERRORS + 1))
else
    echo -e "   ${GREEN}✅ PASS: No .env files${NC}"
fi

# Check 2: No API keys in fixture files
echo ""
echo "📋 Check 2: API keys in fixtures"
if grep -r "api_key\|apikey\|API_KEY\|secret\|SECRET\|token\|TOKEN\|password\|PASSWORD" fixtures/ 2>/dev/null | grep -v "notice\|comment\|//" > /dev/null; then
    echo -e "   ${RED}❌ FAIL: Potential secrets found in fixtures${NC}"
    grep -r "api_key\|apikey\|API_KEY\|secret\|SECRET\|token\|TOKEN\|password\|PASSWORD" fixtures/ 2>/dev/null | grep -v "notice\|comment\|//" | head -5 | while read f; do echo "     → $f"; done
    ERRORS=$((ERRORS + 1))
else
    echo -e "   ${GREEN}✅ PASS: No secrets in fixtures${NC}"
fi

# Check 3: No localhost URLs in fixtures
echo ""
echo "📋 Check 3: localhost/internal URLs in fixtures"
if grep -r "localhost\|127\.0\.0\.1\|0\.0\.0\.0" fixtures/ 2>/dev/null > /dev/null; then
    echo -e "   ${RED}❌ FAIL: Internal URLs found in fixtures${NC}"
    grep -r "localhost\|127\.0\.0\.1\|0\.0\.0\.0" fixtures/ 2>/dev/null | head -5 | while read f; do echo "     → $f"; done
    ERRORS=$((ERRORS + 1))
else
    echo -e "   ${GREEN}✅ PASS: No internal URLs${NC}"
fi

# Check 4: No real email domains
echo ""
echo "📋 Check 4: Real email domains in fixtures"
if grep -r "@gmail\|@outlook\|@hotmail\|@yahoo\|@proton" fixtures/ 2>/dev/null > /dev/null; then
    echo -e "   ${YELLOW}⚠️  WARN: Real email domains found in fixtures${NC}"
    grep -r "@gmail\|@outlook\|@hotmail\|@yahoo\|@proton" fixtures/ 2>/dev/null | head -5 | while read f; do echo "     → $f"; done
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ PASS: All emails use fictional domains${NC}"
fi

# Check 5: Screenshots contain only dummy data markers
echo ""
echo "📋 Check 5: README references valid screenshot paths"
if [ -f "README.md" ]; then
    MISSING=$(grep -oP 'screenshots/[^)]+\.png' README.md 2>/dev/null | while read path; do
        if [ ! -f "$path" ]; then
            echo "$path"
        fi
    done)
    if [ -n "$MISSING" ]; then
        echo -e "   ${YELLOW}⚠️  WARN: Missing screenshot files referenced in README.md${NC}"
        echo "$MISSING" | head -5 | while read f; do echo "     → $f"; done
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "   ${GREEN}✅ PASS: All README screenshot references valid${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  SKIP: README.md not found${NC}"
fi

# Check 6: No IP addresses or SSH keys
echo ""
echo "📋 Check 6: IP addresses and SSH keys"
if grep -rE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' fixtures/ scripts/ 2>/dev/null | grep -v "version\|generatedAt\|notice" > /dev/null; then
    echo -e "   ${RED}❌ FAIL: IP addresses found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "   ${GREEN}✅ PASS: No IP addresses${NC}"
fi

if grep -r "BEGIN.*PRIVATE\|ssh-rsa\|ssh-ed25519" . --include="*.md" --include="*.json" --include="*.sh" 2>/dev/null | grep -v ".git/" > /dev/null; then
    echo -e "   ${RED}❌ FAIL: SSH keys or private keys found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "   ${GREEN}✅ PASS: No SSH keys or private keys${NC}"
fi

# Summary
echo ""
echo "==========================================="
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ FAILED: $ERRORS errors, $WARNINGS warnings${NC}"
    echo "   Fix errors before committing."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED with warnings: $WARNINGS warnings${NC}"
    echo "   Review warnings above."
    exit 0
else
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo "   Safe to commit."
    exit 0
fi
