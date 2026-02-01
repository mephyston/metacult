import { fetchWithRetry } from '@metacult/shared-core';
import { logger } from '@metacult/backend-infrastructure';
import type { GoogleBookRaw } from '../types/raw-responses';

/**
 * Provider Infrastructure pour l'API Google Books.
 */
export class GoogleBooksProvider {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Recherche de livres.
   *
   * @param {string} query - Terme de recherche.
   * @param {AbortSignal} [signal] - Token d'annulation.
   */
  async searchBooks(
    query: string,
    signal?: AbortSignal,
  ): Promise<GoogleBookRaw[]> {
    if (!this.apiKey) return [];
    try {
      const response = await fetchWithRetry(
        `${this.apiUrl}?q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=10&langRestrict=fr`,
        {
          timeoutMs: 5000,
          externalSignal: signal,
        },
      );

      if (!response.ok)
        throw new Error(`GoogleBooks error: ${response.statusText}`);
      const data = (await response.json()) as { items: GoogleBookRaw[] };
      return data.items || [];
    } catch (error) {
      // noinspection ExceptionCaughtLocallyJS
      logger.error({ err: error }, '[GoogleBooks] Search error');
      return [];
    }
  }

  /**
   * Récupère les détails d'un livre.
   *
   * @param {string} id - ID Google Books.
   * @param {AbortSignal} [signal] - Token d'annulation.
   */
  async getMedia(
    id: string,
    signal?: AbortSignal,
  ): Promise<GoogleBookRaw | null> {
    if (!this.apiKey) return null;
    try {
      const response = await fetchWithRetry(
        `${this.apiUrl}/${id}?key=${this.apiKey}`,
        {
          timeoutMs: 5000,
          externalSignal: signal,
        },
      );

      if (!response.ok) return null;
      return (await response.json()) as GoogleBookRaw;
    } catch (error) {
      logger.error({ err: error }, '[GoogleBooks] Get details error');
      return null;
    }
  }

  /**
   * Récupère les livres tendance (basé sur "fiction" en français).
   *
   * @param {AbortSignal} [signal] - Token d'annulation.
   */
  async fetchTrending(signal?: AbortSignal): Promise<GoogleBookRaw[]> {
    if (!this.apiKey) return [];

    try {
      // Google Books n'a pas de "trending" explicite, on cherche les nouveautés "subject:fiction"
      const response = await fetchWithRetry(
        `${this.apiUrl}?q=subject:fiction&orderBy=newest&key=${this.apiKey}&maxResults=20&langRestrict=fr`,
        {
          timeoutMs: 5000,
          externalSignal: signal,
        },
      );

      if (!response.ok) {
        logger.warn(
          { status: response.statusText },
          '[GoogleBooks] Fetch trending failed',
        );
        return [];
      }

      const data = (await response.json()) as { items: GoogleBookRaw[] };
      return data.items || [];
    } catch (error) {
      logger.error({ err: error }, '[GoogleBooks] Trending error');
      return [];
    }
  }
}

// export const googleBooksProvider = new GoogleBooksProvider(); // Removed: Use CatalogModuleFactory
