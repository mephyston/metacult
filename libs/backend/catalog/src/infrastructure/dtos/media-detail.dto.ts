import { z } from 'zod';
import { selectMediaSchema, selectTagSchema } from '../db/media.schema';

export const MediaDetailSchema = selectMediaSchema
  .pick({
    id: true,
    slug: true,
    title: true,
    type: true,
    eloScore: true,
    matchCount: true,
  })
  .extend({
    releaseYear: z.number().nullable(),
    posterUrl: z.string().nullable(),
    rating: z.number().nullable(),
    description: z.string().nullable(),
    tags: z.array(selectTagSchema.pick({ id: true, label: true, slug: true })),
    metadata: z.record(z.string(), z.any()),
  });

export type MediaDetailDto = z.infer<typeof MediaDetailSchema>;
