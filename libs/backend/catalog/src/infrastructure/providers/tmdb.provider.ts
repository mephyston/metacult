import { fetchWithRetry } from '@metacult/shared-core';
import { logger } from '@metacult/backend-infrastructure';
import type { TmdbMovieRaw } from '../types/raw-responses';

/**
 * Provider Infrastructure pour l'API TMDB.
 * Gère les requêtes HTTP et l'authentification.
 */
export class TmdbProvider {
  private apiKey: string;
  private apiUrl = 'https://api.themoviedb.org/3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Recherche un film ou une série sur TMDB.
   *
   * @param {string} query - Terme de recherche.
   * @param {AbortSignal} [signal] - Token d'annulation.
   */
  async searchMovies(
    query: string,
    signal?: AbortSignal,
  ): Promise<TmdbMovieRaw[]> {
    if (!this.apiKey) return [];
    try {
      const response = await fetchWithRetry(
        `${this.apiUrl}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=fr-FR`,
        {
          timeoutMs: 5000,
          externalSignal: signal,
        },
      );

      if (!response.ok) throw new Error(`TMDB error: ${response.statusText}`);
      const data = (await response.json()) as any;
      return data.results || [];
    } catch (error) {
      logger.error({ err: error }, '[TMDB] Search error');
      return [];
    }
  }

  /**
   * Récupère les détails d'un média (film/tv) par ID.
   *
   * @param {string} id - ID TMDB.
   * @param {AbortSignal} [signal] - Token d'annulation.
   */
  async getMedia(
    id: string,
    signal?: AbortSignal,
  ): Promise<TmdbMovieRaw | null> {
    if (!this.apiKey) return null;
    try {
      // Note: On suppose ici 'movie' par défaut, mais idéalement l'ID devrait contenir le type ou on essaie les deux.
      // Pour simplifier dans ce contexte legacy, on tente 'movie'.
      // (Une vraie implémentation robuste distinguerait movie/tv dans l'ID ou ferait 2 appels)
      const response = await fetchWithRetry(
        `${this.apiUrl}/movie/${id}?api_key=${this.apiKey}&language=fr-FR&append_to_response=credits`,
        {
          timeoutMs: 5000,
          externalSignal: signal,
        },
      );

      if (!response.ok) return null; // Not found or error
      return (await response.json()) as TmdbMovieRaw;
    } catch (error) {
      logger.error({ err: error }, '[TMDB] Get details error');
      return null;
    }
  }

  /**
   * Récupère les tendances films et séries.
   * Utilise Promise.allSettled pour ne pas échouer si l'un des deux endpoints rate.
   *
   * @param {AbortSignal} [signal] - Token d'annulation.
   */
  async fetchTrending(signal?: AbortSignal): Promise<TmdbMovieRaw[]> {
    if (!this.apiKey) return [];

    try {
      const urls = [
        `${this.apiUrl}/trending/movie/week?api_key=${this.apiKey}&language=fr-FR`,
        `${this.apiUrl}/trending/tv/week?api_key=${this.apiKey}&language=fr-FR`,
      ];

      const results = await Promise.allSettled(
        urls.map((url) =>
          fetchWithRetry(url, { timeoutMs: 5000, externalSignal: signal }),
        ),
      );

      const medias: TmdbMovieRaw[] = [];

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const response = result.value;
          if (response.ok) {
            const data = (await response.json()) as any;
            if (data.results) {
              medias.push(...data.results);
            }
          }
        } else {
          logger.warn(
            { reason: result.reason },
            '[TMDB] Partial trending fetch failure',
          );
        }
      }

      return medias;
    } catch (error) {
      logger.error({ err: error }, '[TMDB] Trending error');
      return [];
    }
  }
}

// export const tmdbProvider = new TmdbProvider(); // Removed: Use CatalogModuleFactory
