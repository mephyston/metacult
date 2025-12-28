# Install dependencies
FROM oven/bun:1 AS install
WORKDIR /usr/src/app
COPY package.json bun.lock nx.json tsconfig.base.json ./
COPY apps/webapp/package.json ./apps/webapp/package.json
COPY libs ./libs
RUN bun install --frozen-lockfile

# Build
FROM install AS build
COPY . .
RUN cd apps/webapp && bun run build

# Final image
FROM oven/bun:1-alpine AS release
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/apps/webapp/.output ./.output

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", ".output/server/index.mjs" ]
