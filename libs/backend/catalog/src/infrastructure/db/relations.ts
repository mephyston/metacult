import { relations } from 'drizzle-orm';
import { medias, games, movies, tv, books, tags, mediasToTags } from './media.schema'; // Local
import { userInteractions } from './interactions.schema'; // Local
import { users } from '../../../../infrastructure/src/lib/db/schema/users.schema'; // Direct relative import to fix resolution

export const mediasRelations = relations(medias, ({ one, many }) => ({
    game: one(games, {
        fields: [medias.id],
        references: [games.id],
    }),
    movie: one(movies, {
        fields: [medias.id],
        references: [movies.id],
    }),
    tv: one(tv, {
        fields: [medias.id],
        references: [tv.id],
    }),
    book: one(books, {
        fields: [medias.id],
        references: [books.id],
    }),
    tags: many(mediasToTags),
    interactions: many(userInteractions),
}));

export const gamesRelations = relations(games, ({ one }) => ({
    media: one(medias, {
        fields: [games.id],
        references: [medias.id],
    }),
}));

export const moviesRelations = relations(movies, ({ one }) => ({
    media: one(medias, {
        fields: [movies.id],
        references: [medias.id],
    }),
}));

export const tvRelations = relations(tv, ({ one }) => ({
    media: one(medias, {
        fields: [tv.id],
        references: [medias.id],
    }),
}));

export const booksRelations = relations(books, ({ one }) => ({
    media: one(medias, {
        fields: [books.id],
        references: [medias.id],
    }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
    medias: many(mediasToTags),
}));

export const mediasToTagsRelations = relations(mediasToTags, ({ one }) => ({
    media: one(medias, {
        fields: [mediasToTags.mediaId],
        references: [medias.id],
    }),
    tag: one(tags, {
        fields: [mediasToTags.tagId],
        references: [tags.id],
    }),
}));

// This Relation extends the User entity with Interactions
// It should be registered in the Schema passed to Drizzle
export const usersRelations = relations(users, ({ many }) => ({
    interactions: many(userInteractions),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
    user: one(users, {
        fields: [userInteractions.userId],
        references: [users.id],
    }),
    media: one(medias, {
        fields: [userInteractions.mediaId],
        references: [medias.id],
    }),
}));
