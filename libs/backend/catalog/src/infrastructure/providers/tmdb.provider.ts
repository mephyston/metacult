import { fetchWithRetry } from '@metacult/shared-core';
import { logger } from '@metacult/backend-infrastructure';
import type { TmdbMovieRaw, TmdbTvRaw } from '../types/raw-responses';

/**
 * Provider Infrastructure pour l'API TMDB.
 * Gère les requêtes HTTP et l'authentification.
 */
export class TmdbProvider {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.themoviedb.org/3';

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
      const data = (await response.json()) as { results: TmdbMovieRaw[] };
      return data.results || [];
    } catch (error) {
      // noinspection ExceptionCaughtLocallyJS
      logger.error({ err: error }, '[TMDB] Search error');
      return [];
    }
  }

  /**
   * Récupère les détails d'un média (film/tv) par ID.
   *
   * @param {string} id - ID TMDB.
   * @param {'movie' | 'tv'} [type] - Type de média.
   * @param {AbortSignal} [signal] - Token d'annulation.
   */
  async getMedia(
    id: string,
    type: 'movie' | 'tv' = 'movie', // Default to movie to maintain backward compatibility if needed, though we should be explicit
    signal?: AbortSignal,
  ): Promise<TmdbMovieRaw | TmdbTvRaw | null> {
    if (!this.apiKey) return null;
    try {
      const endpoint = type === 'movie' ? 'movie' : 'tv';
      const response = await fetchWithRetry(
        `${this.apiUrl}/${endpoint}/${id}?api_key=${this.apiKey}&language=fr-FR&append_to_response=credits`,
        {
          timeoutMs: 5000,
          externalSignal: signal,
        },
      );

      if (!response.ok) return null; // Not found or error
      return (await response.json()) as TmdbMovieRaw | TmdbTvRaw;
    } catch (error) {
      // noinspection ExceptionCaughtLocallyJS
      logger.error({ err: error, id, type }, '[TMDB] Get details error');
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

      for (const [i, result] of results.entries()) {
        if (result.status === 'fulfilled') {
          const response = result.value;
          if (response.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (await response.json()) as { results: any[] };
            if (data.results) {
              const type = i === 0 ? 'movie' : 'tv';
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const items = data.results.map((item: any) => ({
                ...item,
                media_type: type,
              }));
              medias.push(...items);
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
      // noinspection ExceptionCaughtLocallyJS
      logger.error({ err: error }, '[TMDB] Trending error');
      return [];
    }
  }
}

// export const tmdbProvider = new TmdbProvider(); // Removed: Use CatalogModuleFactory
