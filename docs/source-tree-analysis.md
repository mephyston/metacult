# Source Tree Analysis

**Analysis Date:** 2026-01-06

## Directory Structure

```
metacult/
├── apps/                        # Application Entry Points
│   ├── api/                     # API Gateway (ElysiaJS)
│   │   └── src/index.ts         # Server Entry Point
│   ├── webapp/                  # Main Application (Nuxt)
│   │   ├── pages/               # Application Routes
│   │   └── components/          # App-Specific Components
│   ├── website/                 # Marketing Site (Astro)
│   │   ├── src/pages/           # Static/SSR Pages
│   │   └── src/layouts/         # Site Layouts
│   ├── worker/                  # Background Worker
│   │   └── src/index.ts         # Worker Entry Point
│   └── e2e/                     # Playwright Tests
├── libs/                        # Shared Code & Modules
│   ├── backend/                 # Backend Domain Modules (DDD)
│   │   ├── catalog/             # Media Catalog Domain
│   │   ├── discovery/           # Recommendation/Search Domain
│   │   ├── identity/            # Auth & User Domain
│   │   ├── infrastructure/      # Shared Infra (DB, Drizzle)
│   │   ├── interaction/         # User Interaction Domain
│   │   ├── marketing/           # Marketing/Comms Domain
│   │   └── ranking/             # Content Ranking Domain
│   └── shared/                  # Universal Shared Libs
│       ├── core/                # Utilities & Types
│       └── ui/                  # Vue Component Library
├── docs/                        # Project Documentation
├── .github/                     # CI/CD Workflows
├── .agent/                      # AI Agent Configurations
├── drizzle.config.ts            # ORM Configuration
├── nx.json                      # Monorepo Configuration
└── package.json                 # Workspace Dependencies
```

## Critical Directories

### Domain Modules (`libs/backend/`)

This project follows a Modular Monolith architecture where business logic is split by domain.

- **catalog**: Manages media items (movies, books, games). Contains schema `media.schema.ts`.
- **identity**: Handles authentication and user profiles. Contains `auth.schema.ts`.
- **interaction**: Manages user actions like reviews, swipes, and ratings. Contains `interactions.schema.ts`.
- **discovery**: Handles recommendations (affinity, similarity). Contains `user_media_affinity.schema.ts`.

### Shared UI (`libs/shared/ui/`)

A centralized component library used by both `apps/webapp` and `apps/website`.

- **src/components/ui**: Primitive components (shadcn-vue style) like `Button`, `Card`, `Dialog`.
- **src/components/features**: Business-aware components like `SwipeCard`, `ReviewDeck`.

### Infrastructure

- **Database**: Configured via `drizzle.config.ts` in root, pointing to schemas in `libs/backend`.
- **CI/CD**: Workflows in `.github/workflows`.
