#!/bin/bash

# Script pour détecter les magic strings dans le code
# Usage: ./scripts/check-magic-strings.sh

set -e

ERRORS=0
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking for magic strings..."
echo ""

# 1. Backend: Messages hardcodés dans les responses
echo "📦 Checking backend responses..."
BACKEND_MESSAGES=$(grep -rn --include="*.ts" \
  --exclude="*.spec.ts" \
  --exclude="*.test.ts" \
  -E 'message:\s*["'"'"'][^"'"'"'$API_]{10,}["'"'"']' \
  libs/backend apps/api 2>/dev/null | grep -v "API_MESSAGES" | grep -v "LOG_MESSAGES" | grep -v "//" || true)

if [ -n "$BACKEND_MESSAGES" ]; then
  echo -e "${RED}❌ Found hardcoded messages in backend:${NC}"
  echo "$BACKEND_MESSAGES"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No hardcoded messages in backend${NC}"
fi
echo ""

# 2. Backend: Erreurs avec messages hardcodés
echo "🚨 Checking backend errors..."
BACKEND_ERRORS=$(grep -rn --include="*.ts" \
  --exclude="*.spec.ts" \
  --exclude="*.test.ts" \
  -E 'throw new \w+Error\(["'"'"'][^"'"'"']+["'"'"']' \
  libs/backend apps/api 2>/dev/null | grep -v "API_MESSAGES" | grep -v "test" || true)

if [ -n "$BACKEND_ERRORS" ]; then
  echo -e "${YELLOW}⚠️  Found throw Error with potential hardcoded strings:${NC}"
  echo "$BACKEND_ERRORS"
  echo -e "${YELLOW}(Review these manually - some may be legitimate)${NC}"
else
  echo -e "${GREEN}✅ No hardcoded error messages${NC}"
fi
echo ""

# 3. Frontend Nuxt: Textes hardcodés dans les templates (>15 caractères)
echo "🎨 Checking Nuxt templates..."
NUXT_STRINGS=$(grep -rn --include="*.vue" \
  -E '>[\s]*["'"'"']?[A-ZÀ-ÿ][^<${]{15,}["'"'"']?[\s]*<' \
  apps/webapp/app 2>/dev/null | grep -v '\$t(' | grep -v "test" || true)

if [ -n "$NUXT_STRINGS" ]; then
  echo -e "${RED}❌ Found hardcoded strings in Nuxt templates:${NC}"
  echo "$NUXT_STRINGS"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No hardcoded strings in Nuxt templates${NC}"
fi
echo ""

# 4. Frontend Astro: Textes hardcodés (hors design system)
echo "🌟 Checking Astro pages..."
ASTRO_STRINGS=$(grep -rn --include="*.astro" \
  -E '>[\s]*["'"'"']?[A-ZÀ-ÿ][^<{$]{20,}["'"'"']?[\s]*<' \
  apps/website/src/pages apps/website/src/components 2>/dev/null | \
  grep -v '/ds/' | grep -v 'fr\.' | grep -v "test" || true)

if [ -n "$ASTRO_STRINGS" ]; then
  echo -e "${RED}❌ Found hardcoded strings in Astro pages:${NC}"
  echo "$ASTRO_STRINGS"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No hardcoded strings in Astro pages${NC}"
fi
echo ""

# 5. Validation: Chercher les strings de validation hardcodées
echo "✔️  Checking validators..."
VALIDATOR_STRINGS=$(grep -rn --include="validators*.ts" \
  -E 'throw new.*Error\(['"'"'"]' \
  libs/backend 2>/dev/null | grep -v "API_MESSAGES.VALIDATION" || true)

if [ -n "$VALIDATOR_STRINGS" ]; then
  echo -e "${RED}❌ Found hardcoded validation messages:${NC}"
  echo "$VALIDATOR_STRINGS"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No hardcoded validation messages${NC}"
fi
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ SUCCESS: No critical magic strings found!${NC}"
  echo ""
  echo "📊 Summary:"
  echo "  • Backend responses: ✅"
  echo "  • Backend errors: ✅"
  echo "  • Nuxt templates: ✅"
  echo "  • Astro pages: ✅"
  echo "  • Validators: ✅"
  exit 0
else
  echo -e "${RED}❌ FAILED: Found $ERRORS categories with magic strings${NC}"
  echo ""
  echo "Please fix the issues above and run again."
  exit 1
fi
