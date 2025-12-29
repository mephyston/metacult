import { pgTable, uuid, text, timestamp, real, jsonb, json, integer, pgEnum } from 'drizzle-orm/pg-core';
import type { ProviderMetadata } from '@metacult/backend/domain';

// --- Enums ---
export const mediaTypeEnum = pgEnum('media_type', [
    'GAME',
    'MOVIE',
    'TV',
    'BOOK',
]);

// --- Tables ---

// Central Table
export const medias = pgTable('medias', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: mediaTypeEnum('type').notNull(),
    title: text('title').notNull(),
    releaseDate: timestamp('release_date', { mode: 'date' }),
    globalRating: real('global_rating'),
    providerMetadata: jsonb('provider_metadata').$type<ProviderMetadata>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Extension: Games
export const games = pgTable('games', {
    id: uuid('id')
        .primaryKey()
        .references(() => medias.id, { onDelete: 'cascade' }),
    platform: json('platform').$type<string[]>().default([]),
    developer: text('developer'),
    timeToBeat: integer('time_to_beat'),
});

// Extension: Movies
export const movies = pgTable('movies', {
    id: uuid('id')
        .primaryKey()
        .references(() => medias.id, { onDelete: 'cascade' }),
    director: text('director'),
    durationMinutes: integer('duration_minutes'),
});

// Extension: TV Shows
export const tv = pgTable('tv', {
    id: uuid('id')
        .primaryKey()
        .references(() => medias.id, { onDelete: 'cascade' }),
    creator: text('creator'), // Showrunner or Creator
    episodesCount: integer('episodes_count'),
    seasonsCount: integer('seasons_count'),
});

// Extension: Books
export const books = pgTable('books', {
    id: uuid('id')
        .primaryKey()
        .references(() => medias.id, { onDelete: 'cascade' }),
    author: text('author'),
    pages: integer('pages'),
});

// Shared: Tags
export const tags = pgTable('tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').unique().notNull(),
    label: text('label').notNull(),
    category: text('category').notNull(),
});

// Join: Medias <-> Tags
export const mediasToTags = pgTable('medias_to_tags', {
    mediaId: uuid('media_id')
        .references(() => medias.id, { onDelete: 'cascade' })
        .notNull(),
    tagId: uuid('tag_id')
        .references(() => tags.id, { onDelete: 'cascade' })
        .notNull(),
}, (t) => ({
    pk: [t.mediaId, t.tagId],
}));
