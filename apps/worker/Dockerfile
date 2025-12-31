FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# Install dependencies (using cache)
FROM base AS install
COPY package.json bun.lock ./
COPY apps/worker/package.json ./apps/worker/package.json
RUN bun install

# Build stage (Optimized cache)
FROM base AS build
COPY --from=install /usr/src/app/node_modules ./node_modules
# ✅ Copy source code AFTER dependencies
COPY . .

# Run Tests during build
RUN bun test apps/worker

# Final image
FROM base AS release
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app .

# Run the worker
ENV NODE_ENV=production
USER bun
ENTRYPOINT []
CMD [ "bun", "apps/worker/src/index.ts" ]
