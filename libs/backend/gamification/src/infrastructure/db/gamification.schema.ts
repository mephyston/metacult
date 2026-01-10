import {
  pgSchema,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const gamificationSchema = pgSchema('gamification');

export const userStats = gamificationSchema.table(
  'user_stats',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().unique(), // One entry per user
    xp: integer('xp').default(0).notNull(),
    level: integer('level').default(1).notNull(),
    currLevelXp: integer('curr_level_xp').default(0).notNull(), // XP accumulated in current level
    nextLevelXp: integer('next_level_xp').default(100).notNull(), // XP needed for next level
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    xpIdx: index('idx_user_stats_xp').on(t.xp),
  }),
);

// --- Zod Schemas ---
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertUserStatsSchema = createInsertSchema(userStats);
export const selectUserStatsSchema = createSelectSchema(userStats);
