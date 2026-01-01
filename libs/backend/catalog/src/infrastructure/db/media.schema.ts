import { pgTable, uuid, text, timestamp, real, jsonb, json, integer, pgEnum } from 'drizzle-orm/pg-core';
import type { ProviderMetadata } from '../types/raw-responses';

// --- Enums ---
/** Enumération des types de médias persistés. */
export const mediaTypeEnum = pgEnum('media_type', [
    'GAME',
    'MOVIE',
    'TV',
    'BOOK',
]);

// --- Tables ---

// Central Table
/** Table principale des Médias (Pattern Table-Per-Type Inheritance). */
export const medias = pgTable('medias', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: mediaTypeEnum('type').notNull(),
    slug: text('slug').unique().notNull(),
    title: text('title').notNull(),
    releaseDate: timestamp('release_date', { mode: 'date' }),
    globalRating: real('global_rating'),
    providerMetadata: jsonb('provider_metadata').$type<ProviderMetadata>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Extension: Games
/** Table étendue pour les Jeux Vidéo. */
export const games = pgTable('games', {
    id: uuid('id')
        .primaryKey()
        .references(() => medias.id, { onDelete: 'cascade' }),
    platform: json('platform').$type<string[]>().default([]),
    developer: text('developer'),
    timeToBeat: integer('time_to_beat'),
});

// Extension: Movies
/** Table étendue pour les Films. */
export const movies = pgTable('movies', {
    id: uuid('id')
        .primaryKey()
        .references(() => medias.id, { onDelete: 'cascade' }),
    director: text('director'),
    durationMinutes: integer('duration_minutes'),
});

// Extension: TV Shows
/** Table étendue pour les Séries TV. */
export const tv = pgTable('tv', {
    id: uuid('id')
        .primaryKey()
        .references(() => medias.id, { onDelete: 'cascade' }),
    creator: text('creator'), // Showrunner or Creator
    episodesCount: integer('episodes_count'),
    seasonsCount: integer('seasons_count'),
});

// Extension: Books
/** Table étendue pour les Livres. */
export const books = pgTable('books', {
    id: uuid('id')
        .primaryKey()
        .references(() => medias.id, { onDelete: 'cascade' }),
    author: text('author'),
    pages: integer('pages'),
});

// Shared: Tags
/** Table des Tags (Système de classification). */
export const tags = pgTable('tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').unique().notNull(),
    label: text('label').notNull(),
    category: text('category').notNull(),
});

// Join: Medias <-> Tags
/** Table de jointure Many-to-Many entre Médias et Tags. */
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
