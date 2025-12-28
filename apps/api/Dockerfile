FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# Install dependencies (using cache)
FROM base AS install
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
RUN bun install

# Final image
FROM base AS release
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .

# Run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT []
CMD [ "bun", "apps/api/index.ts" ]
