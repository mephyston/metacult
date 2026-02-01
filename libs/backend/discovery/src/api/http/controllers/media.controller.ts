import { Elysia, t } from 'elysia';
import { mediaSchema } from '@metacult/backend-catalog';
import { getDbConnection, logger } from '@metacult/backend-infrastructure';
import { DrizzleCatalogRepository } from '../../../infrastructure/repositories/drizzle-catalog.repository';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

// const { db } = getDbConnection(); // Moved inside handlers

export const mediaController = new Elysia({ prefix: '/media' }).post(
  '/batch',
  async ({ body, set }) => {
    try {
      const { db } = getDbConnection();
      const catalogRepo = new DrizzleCatalogRepository(
        db as unknown as NodePgDatabase<typeof mediaSchema>,
      );
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
    } catch (e: unknown) {
      const err = e as Error;
      logger.error({ err }, '[MediaController] Error fetching batch media');
      set.status = 500;
      return {
        success: false,
        message: 'Failed to fetch media batch',
        error: err.message,
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
