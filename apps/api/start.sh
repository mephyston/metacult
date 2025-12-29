#!/bin/sh
set -e

echo "🚀 Starting API Service..."

echo "📦 Running Migrations..."
bun libs/backend/infrastructure/src/lib/db/migrate.ts

echo "🔥 Starting Server..."
exec bun apps/api/index.ts
