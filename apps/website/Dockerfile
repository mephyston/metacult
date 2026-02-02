# --- Stage 1: Builder ---
FROM oven/bun:1 AS builder

WORKDIR /app

# 1. Copy essential configuration files
COPY package.json bun.lock nx.json tsconfig.base.json tsconfig.json* ./

# 2. Copy workspace configurations
COPY apps/api/package.json ./apps/api/
COPY apps/webapp/package.json ./apps/webapp/
COPY apps/website/package.json ./apps/website/
COPY apps/worker/package.json ./apps/worker/
COPY apps/docs/package.json ./apps/docs/

COPY libs/shared/core/package.json ./libs/shared/core/
COPY libs/shared/ui/package.json ./libs/shared/ui/
COPY libs/shared/types/package.json ./libs/shared/types/
COPY libs/shared/local-db/package.json ./libs/shared/local-db/
COPY libs/shared/sync-manager/package.json ./libs/shared/sync-manager/
COPY libs/backend/catalog/package.json ./libs/backend/catalog/
COPY libs/backend/commerce/package.json ./libs/backend/commerce/
COPY libs/backend/discovery/package.json ./libs/backend/discovery/
COPY libs/backend/gamification/package.json ./libs/backend/gamification/
COPY libs/backend/identity/package.json ./libs/backend/identity/
COPY libs/backend/infrastructure/package.json ./libs/backend/infrastructure/
COPY libs/backend/interaction/package.json ./libs/backend/interaction/
COPY libs/backend/marketing/package.json ./libs/backend/marketing/
COPY libs/backend/ranking/package.json ./libs/backend/ranking/

# Copy E2E package.json as it is a workspace in bun.lock
COPY apps/e2e/package.json ./apps/e2e/

# 3. Install ALL dependencies (needed for build)
# --ignore-scripts prevents husky from running in Docker build
RUN bun install --frozen-lockfile --ignore-scripts

# 4. Copy Full Source
COPY . .

# 5. Build Website (Astro)
# This generates dist/
# Use direct astro build to avoid Nx graph construction issues in Docker
WORKDIR /app/apps/website
ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA
RUN bun run build
WORKDIR /app

# --- Stage 2: Runner ---
FROM oven/bun:1 AS runner

WORKDIR /app

# 1. Copy built artifacts from builder
COPY --from=builder /app/apps/website/dist ./dist

# 2. Environment Setup
ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# 3. Run Astro Server
CMD ["bun", "./dist/server/entry.mjs"]
