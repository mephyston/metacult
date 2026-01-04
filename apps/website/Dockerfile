# --- Stage 1: Builder ---
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# 1. Copy essential configuration files
COPY package.json bun.lock nx.json tsconfig.base.json ./

# 2. Copy workspace configurations
COPY apps/api/package.json ./apps/api/
COPY apps/webapp/package.json ./apps/webapp/
COPY apps/website/package.json ./apps/website/
COPY apps/worker/package.json ./apps/worker/

COPY libs/shared/core/package.json ./libs/shared/core/
COPY libs/shared/ui/package.json ./libs/shared/ui/

# Copy E2E package.json as it is a workspace in bun.lock
COPY apps/e2e/package.json ./apps/e2e/

# 3. Install ALL dependencies (needed for build)
# --ignore-scripts prevents husky from running in Docker build
RUN bun install --frozen-lockfile --ignore-scripts

# 4. Copy Full Source
COPY . .

# 5. Build Website (Astro)
# This generates dist/
# NX_DAEMON=false to avoid Nx daemon issues in Docker
ENV NX_DAEMON=false
RUN bun run nx build website

# --- Stage 2: Runner ---
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# 1. Copy built artifacts from builder
COPY --from=builder /app/apps/website/dist ./dist

# 2. Environment Setup
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# 3. Run Astro Server
CMD ["bun", "./dist/server/entry.mjs"]
