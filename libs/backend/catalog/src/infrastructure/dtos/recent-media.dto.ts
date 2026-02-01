import { z } from 'zod';
import { selectMediaSchema } from '../db/media.schema';

import type { RecentMediaReadModel } from '../../domain/read-models/recent-media.read-model';

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

export type RecentMediaItemDto = RecentMediaReadModel;
