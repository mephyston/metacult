import type { TmdbMovieRaw, TmdbTvRaw } from '../types/raw-responses';

export type TmdbMediaRaw = TmdbMovieRaw | TmdbTvRaw;

/**
 * Provider Infrastructure pour l'API TMDB (The Movie Database).
 * Gère les Films et les Séries TV.
 */
export class TmdbProvider {
    private apiKey: string;
    private apiUrl = 'https://api.themoviedb.org/3';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Recherche multi-critères (Films + Séries).
     * 
     * @param {string} query - Terme de recherche.
     * @returns {Promise<TmdbMediaRaw[]>} Résultats bruts filtrés.
     */
    async searchMulti(query: string): Promise<TmdbMediaRaw[]> {
        if (!this.apiKey) return [];

        const url = `${this.apiUrl}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur Provider [TMDB] : ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { results: any[] };
        // Filter only movies and tv shows
        return data.results
            .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
            .map((item: any) => item as TmdbMediaRaw);
    }

    /**
     * Récupère les détails d'un média.
     * 
     * @param {string} id - ID TMDB.
     * @param {'movie' | 'tv'} type - Type de média.
     */
    async getDetails(id: string, type: 'movie' | 'tv'): Promise<TmdbMediaRaw | null> {
        if (!this.apiKey) return null;

        const url = `${this.apiUrl}/${type}/${id}?api_key=${this.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur Provider [TMDB] : ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as TmdbMediaRaw;
    }
}

// export const tmdbProvider = new TmdbProvider(); // Removed: Use CatalogModuleFactory
