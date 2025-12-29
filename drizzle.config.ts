import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: [
        './libs/backend/infrastructure/src/lib/db/schema.ts',
        './libs/backend/infrastructure/src/lib/db/schema/auth.schema.ts',
    ],
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/metacult',
    },
});
