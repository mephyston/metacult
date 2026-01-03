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

# libs/backend/ranking has no package.json yet
COPY libs/shared/ui/package.json ./libs/shared/ui/

# 3. Install production dependencies only
RUN bun install --frozen-lockfile --production

# 4. Copy Source Code
COPY apps/worker ./apps/worker
# We need libs because backend code relies on them
COPY libs ./libs

# 5. Set Environment and Start
ENV NODE_ENV=production
# Worker doesn't expose a port usually, but if it does:
# ENV PORT=3000 

CMD ["bun", "apps/worker/src/index.ts"]
