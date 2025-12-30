#!/bin/sh
set -e

echo "Current directory: $(pwd)"
ls -la libs/backend

echo "Running database migrations..."
bun run db:migrate:prod

echo "Starting application..."
exec bun apps/api/index.ts
