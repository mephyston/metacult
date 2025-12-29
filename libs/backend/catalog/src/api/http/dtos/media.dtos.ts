import { z } from 'zod';
import { MediaType } from '../../domain/entities/media.entity';

export const SearchMediaSchema = z.object({
    query: z.object({
        q: z.string().optional(),
        type: z.nativeEnum(MediaType).optional(),
        tag: z.string().optional(),
    }),
});

export const ImportMediaSchema = z.object({
    body: z.object({
        mediaId: z.string().min(1),
        type: z.nativeEnum(MediaType),
    }),
});

export type SearchMediaDto = z.infer<typeof SearchMediaSchema>;
export type ImportMediaDto = z.infer<typeof ImportMediaSchema>;
