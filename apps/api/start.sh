#!/bin/sh
set -e

echo "Running database migrations..."
bun run db:migrate:prod

echo "Starting application..."
exec bun apps/api/index.ts
