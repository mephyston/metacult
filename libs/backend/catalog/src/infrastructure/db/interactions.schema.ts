import { pgTable, uuid, text, pgEnum, integer } from 'drizzle-orm/pg-core';
import { users } from '@metacult/backend/infrastructure'; // Direct relative import
import { medias } from './media.schema';
import { relations } from 'drizzle-orm';

// --- Enums ---
/** Enumération des types d'interaction utilisateur. */
export const interactionTypeEnum = pgEnum('interaction_type', [
    'RATING',
    'BACKLOG',
    'DUEL_WIN',
    'DUEL_LOSS',
]);

// --- Tables ---

// Interactions
/** Table des interactions utilisateurs (Notes, Backlog...). */
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

// Relations are defined in relations.ts

