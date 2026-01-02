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

# Build Nuxt App
# Nuxt output -> .output/
WORKDIR /app/apps/webapp
RUN bun run build

# --------------------------------------------------------
# Stage 3: Runner
# --------------------------------------------------------
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy output from builder
COPY --from=builder /app/apps/webapp/.output /app/.output

CMD ["bun", ".output/server/index.mjs"]
