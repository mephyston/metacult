#!/bin/bash

# Script pour remplacer tous les console.log/warn/error par logger dans le backend
# Usage: bash scripts/replace-console-with-logger.sh

FILES=$(find libs/backend apps/api apps/worker -name "*.ts" -not -name "*.test.ts" -not -name "*.spec.ts" -not -name "test-*.ts" -not -name "migrate-*.ts" -not -name "seed.ts" -not -name "reset-db.ts")

echo "🔍 Fichiers trouvés avec console statements:"

for file in $FILES; do
  if grep -q "console\.\(log\|warn\|error\|info\|debug\)" "$file" 2>/dev/null; then
    count=$(grep -c "console\.\(log\|warn\|error\|info\|debug\)" "$file")
    echo "  - $file ($count occurrences)"
  fi
done

echo ""
echo "✅ Liste complète générée. Utilise multi_replace_string_in_file pour les remplacer."
