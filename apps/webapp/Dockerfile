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

COPY libs/shared/core/package.json ./libs/shared/core/
COPY libs/shared/ui/package.json ./libs/shared/ui/
COPY libs/shared/types/package.json ./libs/shared/types/
COPY libs/shared/local-db/package.json ./libs/shared/local-db/
COPY libs/shared/sync-manager/package.json ./libs/shared/sync-manager/

# Copy E2E package.json as it is a workspace in bun.lock
COPY apps/e2e/package.json ./apps/e2e/

# 3. Install ALL dependencies (needed for build)
# --ignore-scripts prevents husky from running in Docker build
RUN bun install --frozen-lockfile --ignore-scripts

# 4. Copy Full Source (Optimized: after install to leverage cache)
COPY . .

# 5. Build Webapp
# Use direct nuxt build to avoid Nx graph construction issues in Docker
WORKDIR /app/apps/webapp
ARG GIT_SHA
ENV NUXT_PUBLIC_GIT_SHA=$GIT_SHA
ENV GIT_SHA=$GIT_SHA
RUN bun run build
WORKDIR /app

# --- Stage 2: Runner ---
FROM oven/bun:1 AS runner

WORKDIR /app

# 1. Copy built artifacts from builder
COPY --from=builder /app/apps/webapp/.output ./.output

# 2. Environment Setup
ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA
ENV NUXT_PUBLIC_GIT_SHA=$GIT_SHA
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 3. Run Nuxt Server
CMD ["bun", ".output/server/index.mjs"]
