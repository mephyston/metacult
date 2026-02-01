#!/usr/bin/env bash
# Script to replace AppError references in catch blocks with InfrastructureError
set -e

GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "Replacing AppError references in catch blocks..."

files=(
  "libs/backend/discovery/src/application/queries/get-hall-of-fame/get-hall-of-fame.handler.ts"
  "libs/backend/discovery/src/application/queries/get-upcoming/get-upcoming.handler.ts"
  "libs/backend/discovery/src/application/queries/get-top-rated-by-year/get-top-rated-by-year.handler.ts"
  "libs/backend/discovery/src/application/queries/get-mixed-feed/get-mixed-feed.handler.ts"
  "libs/backend/discovery/src/application/queries/get-trending/get-trending.handler.ts"
  "libs/backend/discovery/src/application/queries/get-controversial/get-controversial.handler.ts"
  "libs/backend/catalog/src/application/queries/get-media-by-id/get-media-by-id.handler.ts"
  "libs/backend/marketing/src/application/queries/get-active-ads/get-active-ads.handler.ts"
  "libs/backend/catalog/src/application/queries/get-top-rated-media/get-top-rated-media.handler.ts"
  "libs/backend/catalog/src/application/queries/search-media/search-media.handler.ts"
  "libs/backend/catalog/src/application/queries/get-recent-media/get-recent-media.handler.ts"
  "libs/backend/ranking/src/application/queries/get-user-rankings/get-user-rankings.handler.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Replace "error instanceof AppError" with "error instanceof InfrastructureError"
    sed -i '' 's/error instanceof AppError/error instanceof InfrastructureError/g' "$file"
    
    echo -e "${GREEN}✓ Fixed: $file${NC}"
  fi
done

echo -e "${GREEN}✓ Done!${NC}"
