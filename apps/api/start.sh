#!/bin/sh
set -e

echo "🚀 Starting API Service..."

echo "📦 Running Migrations..."
bun run db:migrate:prod

echo "🔥 Starting Server..."
exec bun apps/api/index.ts
