# --------------------------------------------------------
# Stage 1: Pruner
# --------------------------------------------------------
FROM oven/bun:1-alpine AS pruner
WORKDIR /app
COPY . .
RUN find . -type f -not -name 'package.json' -not -name 'bun.lockb' -not -name 'tsconfig.json' -delete

# --------------------------------------------------------
# Stage 2: Installer
# --------------------------------------------------------
FROM oven/bun:1-alpine AS installer
WORKDIR /app

# Copy pruned workspace
COPY --from=pruner /app .
RUN bun install --frozen-lockfile

# --------------------------------------------------------
# Stage 3: Runner
# --------------------------------------------------------
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV MIGRATIONS_FOLDER=/app/libs/backend/infrastructure/drizzle

# Copy all node_modules (needed for runtime TS execution)
COPY --from=installer /app/node_modules ./node_modules

# Copy source code (needed for runtime TS execution)
COPY . .

# Run directly with Bun (No build step)
CMD ["bun", "apps/worker/src/index.ts"]
