# Data Models

**ORM:** Drizzle
**Database:** PostgreSQL

## Domain Schemas

The database schema is distributed across domain modules in `libs/backend`.

### Identity Domain (`libs/backend/identity`)

- **Schema File:** `auth.schema.ts`
- **Purpose:** Manages user accounts, sessions, and authentication credentials.

### Catalog Domain (`libs/backend/catalog`)

- **Schema File:** `media.schema.ts`
- **Purpose:** core registry of media items (Movies, Books, Games, TV Series). Likely contains metadata like title, description, release date, and external IDs.

### Interaction Domain (`libs/backend/interaction`)

- **Schema File:** `interactions.schema.ts`
- **Purpose:** records user engagements.
  - **Swipes**: User preferences (Like/Pass).
  - **Reviews**: detailed user feedback.

### Discovery Domain (`libs/backend/discovery`)

- **Schema Files:**
  - `user_media_affinity.schema.ts`: calculated scores of user preference for specific media.
  - `user_similarity.schema.ts`: metric of similarity between users for collaborative filtering.

## Migration Strategy

Migrations are managed via Drizzle Kit, targeting `libs/backend/infrastructure/drizzle`.
