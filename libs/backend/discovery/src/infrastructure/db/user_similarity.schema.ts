import {
  pgTable,
  uuid,
  real,
  timestamp,
  primaryKey,
  index,
  text,
} from 'drizzle-orm/pg-core';

/**
 * Table `user_similarity`
 *
 * Stores the similarity score between two users (neighbors).
 * Used for collaborative filtering (finding users with similar tastes).
 * 'real' is used for float precision (Cosine Similarity is usually -1.0 to 1.0).
 */
export const userSimilarity = pgTable(
  'user_similarity',
  {
    userId: text('user_id').notNull(),
    neighborId: text('neighbor_id').notNull(),
    similarityScore: real('similarity_score').notNull(),
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.neighborId] }),
    userIdIdx: index('idx_user_similarity_user_id').on(t.userId),
  }),
);
