import type { Context } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';

/**
 * Contrôleur HTTP pour le flux de découverte (Feed).
 * Expose les endpoints liés à l'exploration du catalogue (Mixed Feed).
 */
export class FeedController {
  constructor(private readonly getMixedFeedHandler: GetMixedFeedHandler) { }

  /**
   * Récupère un flux mélangé de contenus (Jeux, Films, etc.).
   * 
   * @param {Object} params - Paramètres de requête.
   * @param {string} [params.q] - Terme de recherche optionnel.
   * @returns {Promise<MediaReadDto[]>} Liste de médias.
   */
  async getMixedFeed(params: { q?: string }) {
    const searchTerm = params.q || '';
    const feed = await this.getMixedFeedHandler.execute(new GetMixedFeedQuery(searchTerm));
    return feed;
  }
}
