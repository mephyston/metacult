# --------------------------------------------------------
# Stage 1: Pruner
# --------------------------------------------------------
FROM oven/bun:1-alpine AS pruner
WORKDIR /app
COPY . .
RUN find . -type f -not -name 'package.json' -not -name 'bun.lockb' -not -name 'tsconfig.json' -delete

# --------------------------------------------------------
# Stage 2: Builder
# --------------------------------------------------------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy pruned workspace
COPY --from=pruner /app .
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build Worker
WORKDIR /app/apps/worker
RUN bun build src/index.ts --target=bun --outfile dist/worker.js

# --------------------------------------------------------
# Stage 3: Runner
# --------------------------------------------------------
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV MIGRATIONS_FOLDER=/app/drizzle

# Copy the bundled worker
COPY --from=builder /app/apps/worker/dist/worker.js /app/worker.js

# Copy Migrations
COPY --from=builder /app/libs/backend/infrastructure/drizzle /app/drizzle

CMD ["bun", "worker.js"]
