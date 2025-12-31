
# Install dependencies
# Install dependencies
FROM oven/bun:1-alpine AS install
WORKDIR /usr/src/app
COPY package.json bun.lock nx.json tsconfig.base.json ./
COPY apps/website/package.json ./apps/website/package.json
COPY libs/shared/ui/package.json ./libs/shared/ui/package.json
RUN bun install

# Build
FROM install AS build
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
RUN cd apps/website && bun run build

# Final image
# Final image
FROM oven/bun:1-alpine AS release
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/apps/website/dist ./dist
# Astro Node adapter requires node_modules for some dependencies (e.g. Sharp if used, or bindings)
# Usually standalone mode bundles everything, but let's check config.
# Config says mode: 'standalone', so it should be self-contained for the server entry.
# But static assets (client) need to be served or correctly mapped.

ENV HOST=0.0.0.0

CMD ["bun", "./dist/server/entry.mjs"]
