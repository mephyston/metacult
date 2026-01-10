import { z } from 'zod';
import {
  selectMediaSchema,
  selectTagSchema,
} from '../../infrastructure/db/media.schema';

export const RecentMediaItemSchema = selectMediaSchema
  .pick({
    id: true,
    title: true,
  })
  .extend({
    releaseYear: z.number().nullable(),
    type: z.enum(['game', 'movie', 'tv', 'book']),
    posterUrl: z.string().nullable(),
    tags: z.array(z.string()),
  });

export type RecentMediaItemDto = z.infer<typeof RecentMediaItemSchema>;
