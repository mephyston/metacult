
# Install dependencies
# Install dependencies
FROM oven/bun:1 AS install
WORKDIR /usr/src/app
COPY package.json bun.lock nx.json tsconfig.base.json ./
COPY apps/website/package.json ./apps/website/package.json
COPY libs ./libs
RUN bun install --frozen-lockfile

# Build
FROM install AS build
COPY . .
RUN cd apps/website && bun run build

# Final image
FROM nginx:alpine AS release
COPY --from=build /usr/src/app/apps/website/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
