# --------------------------------------------------------
# Stage 1: Pruner
# Isolate package.json/lockfiles to optimize cache
# --------------------------------------------------------
FROM oven/bun:1-alpine AS pruner
WORKDIR /app

# Copy all files
COPY . .

# Delete everything that is NOT a package.json, lockfile, or tsconfig
# This preserves the workspace directory structure
RUN find . -type f -not -name 'package.json' -not -name 'bun.lockb' -not -name 'tsconfig.json' -delete

# --------------------------------------------------------
# Stage 2: Builder
# Install dependencies and build the app
# --------------------------------------------------------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy pruned workspace structure (deps definitions only)
COPY --from=pruner /app .

# Install dependencies (cached if package.json/lockfile unchanged)
RUN bun install --frozen-lockfile

# Copy source code (this layer changes frequently)
COPY . .

# Build the API to a standalone bundle
RUN ls -R apps/api
RUN bun build ./apps/api/index.ts --target=bun --outfile apps/api/dist/server.js

# --------------------------------------------------------
# Stage 3: Runner
# Minimal runtime image
# --------------------------------------------------------
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Configuration
ENV NODE_ENV=production
ENV MIGRATIONS_FOLDER=/app/drizzle

# Copy the bundled server
COPY --from=builder /app/apps/api/dist/server.js /app/server.js

# Copy Migrations (Drizzle SQL files)
# Infrastructure lib expects migrations in a folder, passed via env var
COPY --from=builder /app/libs/backend/infrastructure/drizzle /app/drizzle

# Run
CMD ["bun", "server.js"]
