import {
  pgTable,
  uuid,
  integer,
  timestamp,
  primaryKey,
  text,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Table `user_media_affinity`
 *
 * Stores the calculated affinity score between a user and a media item.
 * This score is derived from explicit interactions (likes, ratings) and implicit signals.
 * Used by the recommendation engine to rank content.
 */
export const userMediaAffinity = pgTable(
  'user_media_affinity',
  {
    userId: text('user_id').notNull(),
    mediaId: uuid('media_id').notNull(),
    score: integer('score').default(1200).notNull(), // ELO-like score, default 1200
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.mediaId] }),
    scoreIdx: index('idx_affinity_score').on(t.score),
    mediaIdx: index('idx_affinity_media_id').on(t.mediaId),
  }),
);
