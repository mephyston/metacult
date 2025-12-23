FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS install
COPY package.json bun.lock nx.json tsconfig.base.json ./

COPY libs ./libs
RUN bun install --frozen-lockfile

# Build
FROM install AS build
COPY . .
RUN bun run nx build webapp

# Final image
FROM base AS release
COPY --from=build /usr/src/app/apps/webapp/.output ./.output

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", ".output/server/index.mjs" ]
