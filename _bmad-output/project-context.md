---
project_name: 'Metacult'
user_name: 'David'
date: '2026-01-08'
sections_completed:
  ['technology_stack', 'critical_rules', 'testing', 'workflow', 'anti_patterns']
existing_patterns_found: 12
status: 'complete'
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Validated Tech Stack

- **Monorepo**: Nx
- **Runtime**: Bun (Latest)
- **Backend**: ElysiaJS + TypeBox (Strict Data Contract)
- **Frontend PWA**: Nuxt 3 (SPA Mode for interactivity)
- **Frontend SEO**: Astro (SSG for directory/content)
- **Database**: PostgreSQL + Drizzle ORM
- **Local DB**: Dexie.js (IndexedDB Wrapper)
- **Async Processing**: BullMQ (Redis)

## Critical Implementation Rules

### The "Law of the Code" (Architecture Rules)

1.  **Dual-Type Rule (Type Safety)**
    - **Rule**: Backend defines types via TypeBox. Frontend consumes them via `App.server` (Eden Treaty).
    - **FORBIDDEN**: Defining `interface User` manually in the frontend.

2.  **Local-First Data Flow (Unidirectional)**
    - **Rule**: UI Components MUST bind to `LiveQuery` (Dexie) or Pinia Store.
    - **FORBIDDEN**: UI components calling `fetch('/api/stack')` directly.
    - **Pattern**: "Sync-Behind". Background service populates local DB.

3.  **Application Boundary (Public vs Private)**
    - **Rule**: `apps/webapp` (Nuxt) manages AUHTENTICATED experience. `apps/website` (Astro) manages PUBLIC/SEO content.
    - **Integration**: Use standard HTML links `<a href>` to switch between apps (requires full reload).

4.  **Backend Structure (Domain Driven)**
    - **Rule**: Business logic lives in `libs/backend/{domain}` (Pure TS).
    - **FORBIDDEN**: Business logic in API Controllers or UI Components.

5.  **Offline Auth (Optimistic)**

### Testing Strategy

- **Unit Tests**: Vitest (Co-located `*.spec.ts`).
- **E2E Tests**: Playwright (`tests/e2e`).
- **Rule**: "Behavior-Driven". Test the public API of services, not internal private methods.
- **Mocking**: Mock external boundaries (API calls, Dexie) but integration-test the interaction logic.

### Code Quality & Style

- **Linter**: ESLint + Prettier.
- **Exports**: Use Named Exports generally. Default Exports allowed for Vue Components.
- **Barrel Files**: Allowed in `libs/shared/*` for public API. Avoid deep imports `libs/shared/ui/components/Button.vue` -> use `libs/shared/ui`.

### Development Workflow

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`).
- **Branches**: `feature/context-name`, `fix/issue-id`.
- **PRs**: Must pass CI (Lint + Types + Test).

### Critical Anti-Patterns (The "Don't Do This" List)

1.  **Direct DOM Access**: Never use `window` or `document` without checking `if (import.meta.client)`. Failing this breaks SSR(Nuxt) and SSG(Astro).
2.  **Logic in Vue Templates**: Keep template clean. Move complex conditions to `computed` properties.
3.  **God Components**: If a Vue file exceeds 300 lines, extract sub-components or composables.
4.  **Any Type**: `any` is strictly forbidden. Use `unknown` or define the type.
5.  **Hardcoded Secrets**: Never commit `.env` or API keys.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer existing patterns in `libs/shared`.

**For Humans:**

- Update when technology stack changes.
- Remove rules that become obvious to the team over time.

Last Updated: 2026-01-08
