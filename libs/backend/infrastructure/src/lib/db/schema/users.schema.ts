import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

// --- Tables ---

// Users
/** Table applicative des utilisateurs (distincte de auth.user). */
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').unique().notNull(),
    username: text('username').unique().notNull(),
});
