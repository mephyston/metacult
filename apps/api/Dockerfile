FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# Install dependencies (using cache)
FROM base AS install
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
RUN bun install

# Build stage
FROM base AS build
COPY --from=install /usr/src/app/node_modules ./node_modules
# ✅ Copy source code AFTER dependencies
COPY . .

# Run Tests during build to prevent bad deployments
RUN bun test apps/api

# Final image
FROM base AS release
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app .

# Run the app
USER bun
ENV PORT=3000
EXPOSE 3000/tcp
ENTRYPOINT []
CMD ["bun", "apps/api/index.ts"]
