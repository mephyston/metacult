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

COPY libs/backend/catalog/package.json ./libs/backend/catalog/
COPY libs/backend/discovery/package.json ./libs/backend/discovery/
COPY libs/backend/identity/package.json ./libs/backend/identity/
COPY libs/backend/infrastructure/package.json ./libs/backend/infrastructure/
COPY libs/backend/interaction/package.json ./libs/backend/interaction/
COPY libs/backend/marketing/package.json ./libs/backend/marketing/
COPY libs/backend/ranking/package.json ./libs/backend/ranking/

# 3. Install ALL dependencies (needed for build)
RUN bun install --frozen-lockfile

# 4. Copy Full Source (Optimized: after install to leverage cache)
COPY . .

# 5. Build Webapp
# This generates .output/server
RUN bun run nx build webapp

# --- Stage 2: Runner ---
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# 1. Copy built artifacts from builder
COPY --from=builder /app/apps/webapp/.output ./.output

# 2. Environment Setup
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 3. Run Nuxt Server
CMD ["bun", ".output/server/index.mjs"]
