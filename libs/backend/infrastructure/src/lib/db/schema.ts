import { relations } from 'drizzle-orm';
import {
    boolean,
    integer,
    json,
    pgEnum,
    pgTable,
    real,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';

// --- Enums ---
export const workTypeEnum = pgEnum('work_type', [
    'GAME',
    'MOVIE',
    'SHOW',
    'BOOK',
]);

export const interactionTypeEnum = pgEnum('interaction_type', [
    'RATING',
    'BACKLOG',
    'DUEL_WIN',
    'DUEL_LOSS',
]);

// --- Tables ---

// Central Table
export const works = pgTable('works', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: workTypeEnum('type').notNull(),
    title: text('title').notNull(),
    releaseDate: timestamp('release_date', { mode: 'date' }),
    globalRating: real('global_rating'),
    sourceRawData: json('source_raw_data'), // Using json for broader compatibility, jsonb if specific psql features needed
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Extension: Games
export const games = pgTable('games', {
    id: uuid('id')
        .primaryKey()
        .references(() => works.id, { onDelete: 'cascade' }),
    platform: json('platform').$type<string[]>().default([]),
    developer: text('developer'),
    timeToBeat: integer('time_to_beat'),
});

// Extension: Movies
export const movies = pgTable('movies', {
    id: uuid('id')
        .primaryKey()
        .references(() => works.id, { onDelete: 'cascade' }),
    director: text('director'),
    durationMinutes: integer('duration_minutes'),
});

// Shared: Tags
export const tags = pgTable('tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').unique().notNull(),
    label: text('label').notNull(),
    category: text('category').notNull(), // e.g., 'GENRE', 'MOOD'
});

// Join: Works <-> Tags
export const worksToTags = pgTable('works_to_tags', {
    workId: uuid('work_id')
        .references(() => works.id, { onDelete: 'cascade' })
        .notNull(),
    tagId: uuid('tag_id')
        .references(() => tags.id, { onDelete: 'cascade' })
        .notNull(),
}, (t) => ({
    pk: [t.workId, t.tagId],
}));

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
    workId: uuid('work_id')
        .references(() => works.id, { onDelete: 'cascade' })
        .notNull(),
    type: interactionTypeEnum('type').notNull(),
    value: integer('value'), // 1-4 for Ratings
    comments: text('comments'),
}, (t) => ({
    pk: [t.userId, t.workId, t.type], // Composite PK to allow one interaction of each type per user/work? Or just PK? 
    // User constraints says "Flexible to manage Backlog, Ratings...". 
    // Usually a user can Rate AND Backlog? Or is it exclusive?
    // Let's assume (UserId, WorkId, Type) is unique.
}));

// --- Relations ---

export const worksRelations = relations(works, ({ one, many }) => ({
    game: one(games, {
        fields: [works.id],
        references: [games.id],
    }),
    movie: one(movies, {
        fields: [works.id],
        references: [movies.id],
    }),
    tags: many(worksToTags),
    interactions: many(userInteractions),
}));

export const gamesRelations = relations(games, ({ one }) => ({
    work: one(works, {
        fields: [games.id],
        references: [works.id],
    }),
}));

export const moviesRelations = relations(movies, ({ one }) => ({
    work: one(works, {
        fields: [movies.id],
        references: [works.id],
    }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
    works: many(worksToTags),
}));

export const worksToTagsRelations = relations(worksToTags, ({ one }) => ({
    work: one(works, {
        fields: [worksToTags.workId],
        references: [works.id],
    }),
    tag: one(tags, {
        fields: [worksToTags.tagId],
        references: [tags.id],
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
    interactions: many(userInteractions),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
    user: one(users, {
        fields: [userInteractions.userId],
        references: [users.id],
    }),
    work: one(works, {
        fields: [userInteractions.workId],
        references: [works.id],
    }),
}));
