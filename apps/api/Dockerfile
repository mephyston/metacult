# Base image optimized for Bun
FROM oven/bun:1 AS runner

WORKDIR /app

# 1. Copy essential configuration files (Monorepo structure)
COPY package.json bun.lock bunfig.toml nx.json tsconfig.base.json tsconfig.json* ./

# 2. Copy workspace configurations (to ensure bun install works for workspace deps)
COPY apps/api/package.json ./apps/api/
COPY apps/webapp/package.json ./apps/webapp/
COPY apps/website/package.json ./apps/website/
COPY apps/worker/package.json ./apps/worker/

COPY libs/shared/core/package.json ./libs/shared/core/
COPY libs/shared/ui/package.json ./libs/shared/ui/
COPY libs/shared/types/package.json ./libs/shared/types/
COPY libs/shared/local-db/package.json ./libs/shared/local-db/
COPY libs/shared/sync-manager/package.json ./libs/shared/sync-manager/
COPY libs/backend/commerce/package.json ./libs/backend/commerce/

# Copy E2E package.json as it is a workspace in bun.lock
COPY apps/e2e/package.json ./apps/e2e/

# 3. Install ALL dependencies (including devDependencies)
# Required in monorepo: internal libs are referenced as workspace dependencies
# and are not included in production deps. Bun needs them to resolve path aliases.
# --ignore-scripts prevents husky/prepare scripts from running
RUN bun install --frozen-lockfile --ignore-scripts

# 4. Copy Source Code
COPY apps/api ./apps/api
COPY libs ./libs

# 5. Set Environment and Start
ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA
ENV NODE_ENV=production
ENV PORT=3000
RUN ls -R apps/api
RUN ls -R libs/backend/catalog
RUN cat tsconfig.base.json

# API entrypoint is at root: apps/api/index.ts
CMD ["bun", "/app/apps/api/index.ts"]
