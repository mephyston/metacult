
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
# Use full node image to ensure all shared libraries (glib, etc) required by sharp/libvips are present
FROM node:20 AS release
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/apps/website/dist ./dist
# ✅ Copy node_modules to ensure all dependencies are available
COPY --from=install /usr/src/app/node_modules ./node_modules
# 🔧 Side-load sharp to bypass npm/bun conflicts and ensure Node.js compatibility
# 1. Install sharp in a clean temp directory using NPM (ensures Node binaries)
RUN mkdir -p /temp_sharp && \
    cd /temp_sharp && \
    npm init -y && \
    npm install sharp

# 2. Remove existing sharp from app (if any) and copy the fresh one + binaries
RUN rm -rf /usr/src/app/node_modules/sharp && \
    cp -r /temp_sharp/node_modules/* /usr/src/app/node_modules/

# 🔍 Verify sharp works in this Node environment explicitly
RUN node -e "console.log('✅ Sharp verification:', require('sharp/package.json').version); require('sharp')"

ENV HOST=0.0.0.0

CMD ["node", "./dist/server/entry.mjs"]
