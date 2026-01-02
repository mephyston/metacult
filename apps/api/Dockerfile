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

# Build API
RUN bun build apps/api/index.ts --target=bun --outfile apps/api/dist/server.js

# --------------------------------------------------------
# Stage 3: Runner
# --------------------------------------------------------
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV MIGRATIONS_FOLDER=/app/drizzle
ENV PORT=3000

# Copy the bundled server
COPY --from=builder /app/apps/api/dist/server.js /app/server.js

# Copy Migrations
COPY --from=builder /app/libs/backend/infrastructure/drizzle /app/drizzle

CMD ["bun", "server.js"]
