# Base image optimized for Bun
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# 1. Copy essential configuration files (Monorepo structure)
COPY package.json bun.lockb nx.json tsconfig.base.json ./

# 2. Copy workspace configurations (to ensure bun install works for workspace deps)
COPY apps/api/package.json ./apps/api/
COPY apps/webapp/package.json ./apps/webapp/
COPY apps/website/package.json ./apps/website/
COPY apps/worker/package.json ./apps/worker/
COPY libs/backend/catalog/package.json ./libs/backend/catalog/
COPY libs/backend/discovery/package.json ./libs/backend/discovery/
COPY libs/backend/identity/package.json ./libs/backend/identity/
COPY libs/backend/infrastructure/package.json ./libs/backend/infrastructure/
COPY libs/backend/interaction/package.json ./libs/backend/interaction/
COPY libs/backend/marketing/package.json ./libs/backend/marketing/
COPY libs/backend/ranking/package.json ./libs/backend/ranking/
COPY libs/shared/ui/package.json ./libs/shared/ui/

# 3. Install production dependencies only
# Note: In a strict monorepo, we might need all deps to build libs, 
# but for API running TS directly, we typically just need runtime deps.
# Using --frozen-lockfile to ensure consistency.
RUN bun install --frozen-lockfile --production

# 4. Copy Source Code
COPY apps/api ./apps/api
COPY libs ./libs

# 5. Set Environment and Start
ENV NODE_ENV=production
ENV PORT=3000

# Fix for "Elysia not found" or path issues: We run from root
CMD ["bun", "apps/api/src/index.ts"]
