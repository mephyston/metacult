
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
# Pass build args to env for build-time fetching (SSG)
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL
RUN cd apps/website && bun run build

# Final image
FROM nginx:alpine AS release
# Create a basic nginx config if one doesn't exist, or copy if it does
# COPY apps/website/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/apps/website/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
