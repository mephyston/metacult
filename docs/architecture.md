# Architecture Documentation

## Architectural Style

**Modular Monolith with Domain-Driven Design (DDD)**

Metacult adopts a modular monolith approach to balance development velocity with strict boundary enforcement. The codebase is organized into a monorepo (Nx) but logically separated into vertically sliced business domains.

## High-Level Diagram

```mermaid
graph TD
    Client[Web Clients] --> API[API Gateway (Elysia)]
    API --> Domains

    subgraph Domains [Backend Domains]
        Auth[Identity]
        Cat[Catalog]
        Inter[Interaction]
        Disc[Discovery]
    end

    subgraph Infra [Infrastructure]
        DB[(PostgreSQL)]
        Queue[(BullMQ)]
    end

    Domains --> DB
    Domains --> Queue
    Worker[Worker Service] --> Queue
    Worker --> Domains
```

## Domain Design

The backend is split into isolated libraries (`libs/backend/*`), each representing a Bounded Context:

1.  **Identity**: User management, authentication, and authorization.
2.  **Catalog**: The core inventory of cultural artifacts (Movies, Games, Books).
3.  **Interaction**: Captures user behaviors (Ratings, Reviews, Swipes).
4.  **Discovery**: Intelligence layer for Recommendations and Search.
5.  **Marketing**: Manage campaigns and user communications.

## Frontend Architecture

The frontend is split by consumer:

- **Webapp (Nuxt)**: The authenticated application for heavy user interaction (swiping, reviewing).
- **Website (Astro)**: SEO-optimized marketing and landing pages.

Both consume `@metacult/shared-ui` to maintain a consistent visual identity.

## Scalability Strategy

- **Horizontal Scaling**: The API and Worker services are stateless and can be scaled independently.
- **Async Processing**: Heavy tasks are offloaded to BullMQ (handled by `apps/worker`) to keep the API responsive.
- **Runtime**: Utilizes Bun for low-latency startup and execution.
