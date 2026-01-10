# Deployment Guide

## Infrastructure

- **Platform**: Docker-compatible (Railway recommended)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis (for BullMQ)

## Docker Support

The project includes a `Dockerfile` and `docker-compose.yml` for containerized deployment.

### Production Build

Each app can be built and deployed independently using Nx targets.

**API:**

```bash
nx build api
bun run apps/api/dist/index.js
```

**Webapp:**

```bash
nx build webapp
node apps/webapp/.output/server/index.mjs
```

## CI/CD Service

Workflows are located in `.github/workflows`.

- **pipeline.yml**: Main CI pipeline (Test, Build, Lint).
