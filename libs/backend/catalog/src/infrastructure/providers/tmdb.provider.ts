import type { TmdbMovieRaw, TmdbTvRaw } from '../types/raw-responses';

export type TmdbMediaRaw = TmdbMovieRaw | TmdbTvRaw;

export class TmdbProvider {
    private apiKey: string;
    private apiUrl = 'https://api.themoviedb.org/3';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async searchMulti(query: string): Promise<TmdbMediaRaw[]> {
        if (!this.apiKey) return [];

        const url = `${this.apiUrl}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Provider Error [TMDB]: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { results: any[] };
        // Filter only movies and tv shows
        return data.results
            .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
            .map((item: any) => item as TmdbMediaRaw);
    }

    async getDetails(id: string, type: 'movie' | 'tv'): Promise<TmdbMediaRaw | null> {
        if (!this.apiKey) return null;

        const url = `${this.apiUrl}/${type}/${id}?api_key=${this.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Provider Error [TMDB]: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as TmdbMediaRaw;
    }
}

// export const tmdbProvider = new TmdbProvider(); // Removed: Use CatalogModuleFactory
