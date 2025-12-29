import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: [
        './libs/backend/*/src/infrastructure/db/*.schema.ts',
        './libs/backend/infrastructure/src/lib/db/schema/*.schema.ts',
    ],
    out: './libs/backend/infrastructure/drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/metacult',
    },
});
