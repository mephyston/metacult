
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
# ✅ Copy package.json to satisfy npm context
COPY --from=install /usr/src/app/package.json ./package.json

# 🔧 Force fresh install of sharp to ensure correct native bindings
# We remove the sharp present in node_modules to force a fetch
RUN rm -rf node_modules/sharp
RUN npm install sharp --platform=linux --arch=x64 --verbose

ENV HOST=0.0.0.0

CMD ["node", "./dist/server/entry.mjs"]
