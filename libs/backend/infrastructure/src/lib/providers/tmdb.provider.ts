export class TmdbProvider {
    private apiKey = process.env['TMDB_API_KEY'] || '';
    private apiUrl = 'https://api.themoviedb.org/3';

    async searchMulti(query: string): Promise<any[]> {
        if (!this.apiKey) return [];

        try {
            const url = `${this.apiUrl}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`TMDB Search failed: ${response.statusText}`);

            const data = (await response.json()) as { results: any[] };
            // Filter only movies and tv shows
            return data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
        } catch (error) {
            console.error('⚠️ TMDB Search Error:', error);
            return [];
        }
    }

    async getDetails(id: string, type: 'movie' | 'tv'): Promise<any | null> {
        if (!this.apiKey) return null;

        try {
            const url = `${this.apiUrl}/${type}/${id}?api_key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`TMDB Details failed: ${response.statusText}`);
            return (await response.json()) as any;
        } catch (error) {
            console.error('⚠️ TMDB Details Error:', error);
            return null;
        }
    }
}

export const tmdbProvider = new TmdbProvider();
