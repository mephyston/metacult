import { fetchWithRetry } from '@metacult/shared-core';
import type { GoogleBookRaw } from '../types/raw-responses';

/**
 * Provider Infrastructure pour l'API Google Books.
 */
export class GoogleBooksProvider {
    private apiKey: string;
    private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Recherche de livres.
     *
     * @param {string} query - Terme de recherche.
     * @param {AbortSignal} [signal] - Token d'annulation.
     */
    async searchBooks(query: string, signal?: AbortSignal): Promise<GoogleBookRaw[]> {
        if (!this.apiKey) return [];
        try {
            const response = await fetchWithRetry(
                `${this.apiUrl}?q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=10&langRestrict=fr`,
                {
                    timeoutMs: 5000,
                    externalSignal: signal
                }
            );

            if (!response.ok) throw new Error(`GoogleBooks error: ${response.statusText}`);
            const data = await response.json() as any;
            return data.items || [];
        } catch (error) {
            console.error('⚠️ Erreur Recherche GoogleBooks :', error);
            return [];
        }
    }

    /**
     * Récupère les détails d'un livre.
     *
     * @param {string} id - ID Google Books.
     * @param {AbortSignal} [signal] - Token d'annulation.
     */
    async getMedia(id: string, signal?: AbortSignal): Promise<GoogleBookRaw | null> {
        if (!this.apiKey) return null;
        try {
            const response = await fetchWithRetry(
                `${this.apiUrl}/${id}?key=${this.apiKey}`,
                {
                    timeoutMs: 5000,
                    externalSignal: signal
                }
            );

            if (!response.ok) return null;
            return (await response.json()) as GoogleBookRaw;
        } catch (error) {
            console.error('⚠️ Erreur Détails GoogleBooks :', error);
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
                    externalSignal: signal
                }
            );

            if (!response.ok) {
                console.warn(`[Google Books Provider] Fetch trending failed: ${response.statusText}`);
                return [];
            }

            const data = await response.json() as any;
            return data.items || [];
        } catch (error) {
            console.error('⚠️ Erreur Trending GoogleBooks :', error);
            return [];
        }
    }
}

// export const googleBooksProvider = new GoogleBooksProvider(); // Removed: Use CatalogModuleFactory
