FROM oven/bun:1-alpine AS base
WORKDIR /app

# Copy EVERYTHING (simplest approach to verify context)
COPY . .

# Run ls to confirm context in logs
RUN ls -R apps

# Install
RUN bun install --frozen-lockfile

# Build
RUN bun build apps/worker/src/index.ts --target=bun --outfile apps/worker/dist/worker.js

# Runner (keep strictly separate to minimize size, but let's debug build first)
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/apps/worker/dist/worker.js /app/worker.js
COPY --from=base /app/libs/backend/infrastructure/drizzle /app/drizzle
CMD ["bun", "worker.js"]
