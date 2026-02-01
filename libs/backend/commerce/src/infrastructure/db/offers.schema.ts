import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  pgEnum,
  index,
  boolean,
} from 'drizzle-orm/pg-core';

export const offerTypeEnum = pgEnum('offer_type', [
  'subscription',
  'purchase',
  'rent',
]);
export const offerCategoryEnum = pgEnum('offer_category', [
  'game',
  'movie',
  'show',
  'book',
]);

export const offers = pgTable(
  'offers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    mediaId: uuid('media_id').notNull(),
    provider: text('provider').notNull(),
    category: offerCategoryEnum('category').notNull(),
    type: offerTypeEnum('type').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }),
    currency: text('currency').default('EUR').notNull(),
    url: text('url').notNull(),
    isAffiliated: boolean('is_affiliated').default(false).notNull(),
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  },
  (t) => ({
    mediaIdIdx: index('idx_offers_media_id').on(t.mediaId),
  }),
);
