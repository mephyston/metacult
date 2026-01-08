# Development Guide

## Prerequisites

- **Runtime**: [Bun](https://bun.sh) (v1.0+)
- **Node**: v20+ (for compatibility)
- **Database**: PostgreSQL (v15+)

## Setup

1.  **Clone the repository**:

    ```bash
    git clone <repo-url>
    cd metacult
    ```

2.  **Install Dependencies**:

    ```bash
    bun install
    ```

3.  **Environment Configuration**:
    Copy `.env.example` to `.env` (if available) or create one:
    ```bash
    DATABASE_URL="postgres://user:password@localhost:5432/metacult"
    ```

## Development Commands

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `bun run dev`      | Starts the Nx development server |
| `nx serve webapp`  | Starts the Nuxt webapp           |
| `nx serve api`     | Starts the Elysia API            |
| `nx serve website` | Starts the Astro website         |
| `bun test`         | Runs the test suite              |

## Build

To build all applications:

```bash
nx run-many -t build
```

## Database Management

We use **Drizzle ORM** for database management.

Apply migrations:

```bash
bun drizzle-kit migrate
```

Generate new migrations:

```bash
bun drizzle-kit generate
```
