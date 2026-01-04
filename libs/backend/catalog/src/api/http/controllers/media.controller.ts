import { SearchMediaHandler } from '../../../application/queries/search-media/search-media.handler';
import { ImportMediaHandler } from '../../../application/commands/import-media/import-media.handler';
import { GetRecentMediaHandler } from '../../../application/queries/get-recent-media/get-recent-media.handler';
import { GetMediaByIdQuery } from '../../../application/queries/get-media-by-id/get-media-by-id.query';
import { GetMediaByIdHandler } from '../../../application/queries/get-media-by-id/get-media-by-id.handler';
import type { SearchMediaDto, ImportMediaDto } from '../dtos/media.dtos';
import { MediaType } from '../../../domain/entities/media.entity';
import { logger } from '@metacult/backend-infrastructure';

import { GetTopRatedMediaHandler } from '../../../application/queries/get-top-rated-media/get-top-rated-media.handler';

/**
 * Contrôleur HTTP pour le Catalogue.
 * Orchestre les requêtes entrantes vers les Handlers (CQRS).
 * Découplé du framework HTTP (Elysia) autant que possible.
 */
export class MediaController {
  constructor(
    private readonly searchMediaHandler: SearchMediaHandler,
    private readonly importMediaHandler: ImportMediaHandler,
    private readonly getRecentMediaHandler: GetRecentMediaHandler,
    private readonly getMediaByIdHandler: GetMediaByIdHandler,
    private readonly getTopRatedMediaHandler: GetTopRatedMediaHandler,
  ) {}

  /**
   * Recherche de médias (Jeux, Films, etc.).
   * @param {SearchMediaDto['query']} query
   */
  async search(query: SearchMediaDto['query']) {
    const { q, type, tag } = query;
    const mediaType = type as MediaType | undefined;

    const medias = await this.searchMediaHandler.execute({
      search: q,
      type: mediaType,
      tag,
    });

    return medias;
  }

  /**
   * Import manuel d'un média.
   * @param {ImportMediaDto['body']} body
   */
  async import(body: ImportMediaDto['body']) {
    const { mediaId, type } = body;
    logger.info({ mediaId, type }, '[MediaController] Import request received');

    const { id, slug } = await this.importMediaHandler.execute({
      mediaId,
      type: type as MediaType,
    });

    return { success: true, message: `Imported ${type}: ${mediaId}`, id, slug };
  }

  /**
   * Récupère les médias récemment ajoutés.
   */
  async getRecent() {
    return this.getRecentMediaHandler.execute({ limit: 10 });
  }

  /**
   * Récupère les médias les mieux notés (Top ELO).
   * Endpoint: GET /trends
   */
  async getTrends() {
    return this.getTopRatedMediaHandler.execute({ limit: 5 });
  }

  /**
   * Récupère un média par son identifiant.
   * @param id UUID du média.
   */
  async getById(id: string) {
    return this.getMediaByIdHandler.execute(new GetMediaByIdQuery(id));
  }
}
