import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: [
        './libs/backend/infrastructure/src/lib/db/schema/auth.schema.ts',
        './libs/backend/infrastructure/src/lib/db/schema/media.schema.ts',
        './libs/backend/infrastructure/src/lib/db/schema/users.schema.ts',
        './libs/backend/infrastructure/src/lib/db/schema/relations.ts',
    ],
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/metacult',
    },
});
