
# Install dependencies
# trigger build fix deps
# Install dependencies
FROM oven/bun:1 AS install
WORKDIR /usr/src/app
COPY package.json bun.lock nx.json tsconfig.base.json ./
COPY apps/website/package.json ./apps/website/package.json
COPY libs/shared/ui/package.json ./libs/shared/ui/package.json
RUN bun install

# Build
FROM install AS build
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
# ✅ Receive PUBLIC_API_URL from build args for Client-Side bundling
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL
RUN cd apps/website && bun run build

# Final image
# Use alpine for minimal footprint since we don't need runtime image processing (sharp) anymore
FROM node:20-alpine AS release
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/apps/website/dist ./dist
# Copy node_modules to ensure all dependencies are available
COPY --from=install /usr/src/app/node_modules ./node_modules

ENV HOST=0.0.0.0

CMD ["node", "./dist/server/entry.mjs"]
