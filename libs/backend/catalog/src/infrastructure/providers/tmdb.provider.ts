export class TmdbProvider {
    private apiKey = process.env['TMDB_API_KEY'] || '';
    private apiUrl = 'https://api.themoviedb.org/3';

    async searchMulti(query: string): Promise<any[]> {
        if (!this.apiKey) return [];

        const url = `${this.apiUrl}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Provider Error [TMDB]: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { results: any[] };
        // Filter only movies and tv shows
        return data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
    }

    async getDetails(id: string, type: 'movie' | 'tv'): Promise<any | null> {
        if (!this.apiKey) return null;

        const url = `${this.apiUrl}/${type}/${id}?api_key=${this.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Provider Error [TMDB]: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as any;
    }
}

export const tmdbProvider = new TmdbProvider();
