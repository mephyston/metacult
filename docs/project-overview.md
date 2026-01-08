# Metacult Project Overview

**Generated:** 2026-01-06
**Type:** Modular Monolith (Nx)

## Executive Summary

Metacult is a comprehensive web platform built as a modular monolith using Nx. It features a high-performance backend (ElysiaJS on Bun), a modern frontend ecosystem (Nuxt for the webapp, Astro for the marketing site), and a robust background processing system (BullMQ). The architecture follows Domain-Driven Design (DDD) principles with a clear separation of concerns between domains and infrastructure.

## Repository Structure

The project is organized as an Nx workspace:

| Part             | Path             | Type    | Technology | Description                              |
| ---------------- | ---------------- | ------- | ---------- | ---------------------------------------- |
| **api**          | `apps/api`       | Backend | ElysiaJS   | Main API Gateway/Aggregator              |
| **webapp**       | `apps/webapp`    | Web     | Nuxt 3     | Main User Application                    |
| **website**      | `apps/website`   | Web     | Astro      | Marketing/Landing Site                   |
| **worker**       | `apps/worker`    | Backend | BullMQ     | Asynchronous Task Processor              |
| **shared-ui**    | `libs/shared/ui` | Library | Vue 3      | Shared Component System                  |
| **backend-libs** | `libs/backend/*` | Library | TypeScript | Domain Modules (Catalog, Identity, etc.) |

## Technology Stack

| Category          | Technology   | Version | Purpose                     |
| ----------------- | ------------ | ------- | --------------------------- |
| **Runtime**       | Bun          | Latest  | High-performance JS runtime |
| **Backend**       | ElysiaJS     | Latest  | Fast web framework          |
| **App Frontend**  | Nuxt 3       | 3.x     | SSR Vue framework           |
| **Site Frontend** | Astro        | 5.x     | Content-focused framework   |
| **Database**      | PostgreSQL   | 15+     | Primary Relational DB       |
| **ORM**           | Drizzle      | Latest  | TypeScript ORM              |
| **Styling**       | Tailwind CSS | 3.x     | Utility-first CSS           |
| **Auth**          | BetterAuth   | 1.x     | Authentication Library      |
| **Queues**        | BullMQ       | \*      | Background Jobs             |
| **E2E Tests**     | Playwright   | 1.49    | End-to-End Testing          |

## Key Features

- **Domain-Driven Architecture**: Business logic is isolated in specific domains (`catalog`, `identity`, `interaction`, `discovery`).
- **Shared Design System**: A unified UI library (`libs/shared/ui`) ensures consistency across the webapp and website.
- **Performance First**: Built on Bun and Elysia for maximum throughput.
- **Type Safety**: End-to-end TypeScript coverage.

## Getting Started

1.  **Install Dependencies**:

    ```bash
    bun install
    ```

2.  **Start Development Server**:

    ```bash
    bun run dev
    # or
    nx serve webapp
    ```

3.  **Run Tests**:
    ```bash
    bun test
    ```
