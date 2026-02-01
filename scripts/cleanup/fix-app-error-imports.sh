#!/usr/bin/env bash
# Script to remove unused AppError imports and fix Result type signatures

set -e

# Colors for output
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Removing unused AppError imports...${NC}"

# List of files with unused AppError imports (excluding error.middleware.ts which actually uses it)
files=(
  "libs/backend/discovery/src/application/queries/get-hall-of-fame/get-hall-of-fame.handler.ts"
  "libs/backend/discovery/src/application/queries/get-upcoming/get-upcoming.handler.ts"
  "libs/backend/discovery/src/application/queries/get-top-rated-by-year/get-top-rated-by-year.handler.ts"
  "libs/backend/discovery/src/application/queries/get-mixed-feed/get-mixed-feed.handler.ts"
  "libs/backend/discovery/src/application/queries/get-trending/get-trending.handler.ts"
  "libs/backend/discovery/src/application/queries/get-controversial/get-controversial.handler.ts"
  "libs/backend/catalog/src/application/queries/get-media-by-id/get-media-by-id.handler.ts"
  "libs/backend/marketing/src/application/queries/get-active-ads/get-active-ads.handler.ts"
  "libs/backend/catalog/src/application/commands/import-media/import-media.handler.ts"
  "libs/backend/catalog/src/application/queries/get-top-rated-media/get-top-rated-media.handler.ts"
  "libs/backend/catalog/src/application/queries/search-media/search-media.handler.ts"
  "libs/backend/catalog/src/application/queries/get-recent-media/get-recent-media.handler.ts"
  "libs/backend/ranking/src/application/commands/update-elo-score.handler.ts"
  "libs/backend/ranking/src/application/queries/get-user-rankings/get-user-rankings.handler.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Remove , AppError from imports
    sed -i.bak -E 's/import \{ (.*), AppError(, .*)? \}/import { \1\2 }/' "$file"
    sed -i.bak -E 's/import \{ AppError, (.*) \}/import { \1 }/' "$file"
    sed -i.bak -E 's/import \{ Result, type AppError \}/import { Result }/' "$file"
    
    # Remove Result<T, AppError> and replace with Result<T>
    sed -i.bak -E 's/Result<([^,>]+), AppError>/Result<\1>/g' "$file"
    
    # Clean up double spaces
    sed -i.bak -E 's/  +/ /g' "$file"
    
    # Remove backup file
    rm "${file}.bak"
    
    echo -e "${GREEN}✓ Fixed: $file${NC}"
  else
    echo "File not found: $file"
  fi
done

echo -e "${GREEN}✓ Done!${NC}"
