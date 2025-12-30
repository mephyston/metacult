
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
FROM nginx:alpine AS release
COPY apps/website/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/apps/website/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
