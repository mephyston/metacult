# --- Stage 1: Builder ---
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# 1. Copy essential configuration files
COPY package.json bun.lockb nx.json tsconfig.base.json ./

# 2. Copy workspace configurations
COPY apps/api/package.json ./apps/api/
COPY apps/webapp/package.json ./apps/webapp/
COPY apps/website/package.json ./apps/website/
COPY apps/worker/package.json ./apps/worker/

COPY libs/shared/ui/package.json ./libs/shared/ui/

# 3. Install ALL dependencies (needed for build)
RUN bun install --frozen-lockfile

# 4. Copy Full Source
COPY . .

# 5. Build Website (Astro)
# This generates dist/
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
