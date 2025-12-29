import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

// --- Tables ---

// Users
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').unique().notNull(),
    username: text('username').unique().notNull(),
});
