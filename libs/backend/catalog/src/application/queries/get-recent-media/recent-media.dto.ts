import { t, type Static } from 'elysia';
import { MediaTypeEnum } from '../../../api/http/dtos/media.dtos';

export const RecentMediaItemSchema = t.Object({
    id: t.String(),
    title: t.String(),
    releaseYear: t.Union([t.Number(), t.Null()]),
    type: MediaTypeEnum,
    posterUrl: t.Union([t.String(), t.Null()]),
    tags: t.Array(t.String()),
});

export type RecentMediaItemDto = Static<typeof RecentMediaItemSchema>;
