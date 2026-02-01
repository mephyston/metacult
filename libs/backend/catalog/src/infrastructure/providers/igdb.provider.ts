import { fetchWithRetry } from '@metacult/shared-core';
import { cacheService, logger } from '@metacult/backend-infrastructure';
import type { IgdbGameRaw } from '../types/raw-responses';

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Provider Infrastructure pour l'API IGDB (Twitch).
 * Gère l'authentification OAuth2 Client Credentials et les requêtes Raw.
 *
 * @class IgdbProvider
 */
export class IgdbProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly authUrl = 'https://id.twitch.tv/oauth2/token';
  private readonly apiUrl = 'https://api.igdb.com/v4';

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Récupère ou rafraîchit le token d'accès Twitch (nécessaire pour IGDB).
   * Utilise le cache Redis pour éviter de spammer l'endpoint d'auth.
   *
   * @private
   * @returns {Promise<string | null>} Bearer token ou null si erreur config.
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      logger.error('[IGDB] Credentials missing');
      return null;
    }

    // Attempt to get from cache or fetch new
    return cacheService.getOrSet(
      'igdb_access_token',
      async () => {
        logger.info('[IGDB] Refreshing access token');

        // Short timeout for auth, it should be fast
        const response = await fetchWithRetry(
          `${this.authUrl}?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
          { method: 'POST', timeoutMs: 5000, retries: 2 },
        );

        if (!response.ok) {
          throw new Error(`Auth failed: ${response.statusText}`);
        }

        const data = (await response.json()) as TwitchTokenResponse;
        return data.access_token;
      },
      5000000,
    ); // Token usually lasts ~60 days, we cache safely within that range or rely on expiration logic return
  }

  /**
   * Recherche des jeux sur l'API IGDB.
   * Utilise le langage de requête Apicalypse.
   *
   * @param {string} query - Terme de recherche.
   * @param {AbortSignal} [signal] - Token d'annulation.
   * @returns {Promise<IgdbGameRaw[]>} Liste brute des jeux.
   */
  async searchGames(
    query: string,
    signal?: AbortSignal,
  ): Promise<IgdbGameRaw[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const response = await fetchWithRetry(`${this.apiUrl}/games`, {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body: `search "${query}"; fields name, cover.url, first_release_date, summary, total_rating; limit 10;`,
        timeoutMs: 10000, // IGDB can be slow with complex queries
        externalSignal: signal,
      });

      if (!response.ok)
        throw new Error(`IGDB Search failed: ${response.statusText}`);
      return (await response.json()) as IgdbGameRaw[];
    } catch (error) {
      // noinspection ExceptionCaughtLocallyJS
      logger.error({ err: error }, '[IGDB] Search error');
      return [];
    }
  }

  /**
   * Récupère les détails complets d'un jeu par son ID IGDB.
   *
   * @param {string} id - ID IGDB.
   * @param {AbortSignal} [signal] - Token d'annulation.
   */
  async getGameDetails(
    id: string,
    signal?: AbortSignal,
  ): Promise<IgdbGameRaw | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetchWithRetry(`${this.apiUrl}/games`, {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body: `fields name, cover.url, first_release_date, summary, total_rating, screenshots.url, genres.name, platforms.name, similar_games.name; where id = ${id};`,
        timeoutMs: 10000,
        externalSignal: signal,
      });

      if (!response.ok)
        throw new Error(`IGDB Details failed: ${response.statusText}`);
      const data = (await response.json()) as IgdbGameRaw[];
      return data[0] || null;
    } catch (error) {
      // noinspection ExceptionCaughtLocallyJS
      logger.error({ err: error, id }, '[IGDB] Get by ID error');
      return null;
    }
  }

  /**
   * Alias pour `getGameDetails`.
   * Satisfait l'interface générique si besoin.
   */
  async getMedia(
    id: string,
    signal?: AbortSignal,
  ): Promise<IgdbGameRaw | null> {
    return this.getGameDetails(id, signal);
  }

  /**
   * Récupère les jeux tendance (Sortis récemment ou à venir).
   * Critères: -3 mois < Date < +1 mois.
   * Tri: Popularité desc.
   */
  async fetchTrending(signal?: AbortSignal): Promise<IgdbGameRaw[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    const now = Math.floor(Date.now() / 1000);
    const threeMonthsAgo = now - 90 * 24 * 60 * 60;
    const oneMonthAhead = now + 30 * 24 * 60 * 60;

    const body = `
            fields name, cover.url, first_release_date, summary, aggregated_rating;
            where first_release_date > ${threeMonthsAgo} & first_release_date < ${oneMonthAhead};
            sort popularity desc;
            limit 20;
        `;

    try {
      const response = await fetchWithRetry(`${this.apiUrl}/games`, {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body,
        timeoutMs: 10000,
        externalSignal: signal,
      });

      if (!response.ok) {
        logger.warn(
          { status: response.statusText },
          '[IGDB] Fetch trending failed',
        );
        return [];
      }

      return (await response.json()) as IgdbGameRaw[];
    } catch (error) {
      // noinspection ExceptionCaughtLocallyJS
      logger.error({ err: error }, '[IGDB] Trending error');
      return [];
    }
  }
}

// export const igdbProvider = new IgdbProvider(); // Removed: Use CatalogModuleFactory
