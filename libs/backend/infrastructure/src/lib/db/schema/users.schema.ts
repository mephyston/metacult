import { pgTable, uuid, text, pgEnum, integer } from 'drizzle-orm/pg-core';
import { medias } from './media.schema';
import { relations } from 'drizzle-orm';

// --- Enums ---
export const interactionTypeEnum = pgEnum('interaction_type', [
    'RATING',
    'BACKLOG',
    'DUEL_WIN',
    'DUEL_LOSS',
]);

// --- Tables ---

// Users
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').unique().notNull(),
    username: text('username').unique().notNull(),
});

// Interactions
export const userInteractions = pgTable('user_interactions', {
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    mediaId: uuid('media_id')
        .references(() => medias.id, { onDelete: 'cascade' })
        .notNull(),
    type: interactionTypeEnum('type').notNull(),
    value: integer('value'), // 1-4 for Ratings
    comments: text('comments'),
}, (t) => ({
    pk: [t.userId, t.mediaId, t.type],
}));
