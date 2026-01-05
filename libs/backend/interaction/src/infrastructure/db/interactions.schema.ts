import {
  pgSchema,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const interactionSchema = pgSchema('interaction');

export const actionEnum = interactionSchema.enum('action', [
  'LIKE',
  'DISLIKE',
  'WISHLIST',
  'SKIP',
]);
export const sentimentEnum = interactionSchema.enum('sentiment', [
  'BANGER',
  'GOOD',
  'OKAY',
]);

export const userInteractions = interactionSchema.table(
  'user_interactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(), // Decoupled from users table
    mediaId: uuid('media_id').notNull(), // Reference to media ID
    action: actionEnum('action').notNull(),
    sentiment: sentimentEnum('sentiment'), // Nullable
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      userMediaUnique: uniqueIndex('user_media_unique_idx').on(
        table.userId,
        table.mediaId,
      ),
      mediaIdx: index('media_idx').on(table.mediaId), // Ensure index on mediaId for lookups
    };
  },
);
