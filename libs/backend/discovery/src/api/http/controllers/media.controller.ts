import { Elysia, t } from 'elysia';
import { getDbConnection, logger } from '@metacult/backend-infrastructure';
import { DrizzleCatalogRepository } from '../../../infrastructure/repositories/drizzle-catalog.repository';

const { db } = getDbConnection();
const catalogRepo = new DrizzleCatalogRepository(db as any); // Cast as any because db type inferred is generic

export const mediaController = new Elysia({ prefix: '/media' }).post(
  '/batch',
  async ({ body, set }) => {
    try {
      const medias = await catalogRepo.findByIds(body.ids);
      const mappedMedias = medias.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type.toLowerCase(),
        posterUrl: m.coverUrl?.getValue(),
        rating: m.rating?.getValue() || 0,
        releaseDate: m.releaseYear?.getValue().toString(),
        remoteId: m.slug, // Use slug or id as remoteId fallback
      }));
      return {
        success: true,
        data: mappedMedias,
      };
    } catch (e: any) {
      logger.error({ err: e }, '[MediaController] Error fetching batch media');
      set.status = 500;
      return {
        success: false,
        message: 'Failed to fetch media batch',
        error: e.message,
      };
    }
  },
  {
    body: t.Object({
      ids: t.Array(t.String()),
    }),
    detail: {
      tags: ['Media'],
      summary: 'Get Media Batch',
      description: 'Get details for a list of media IDs.',
    },
  },
);
