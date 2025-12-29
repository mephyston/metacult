import { redisClient } from '../../../../infrastructure/src/lib/redis/redis.client';
// import { cacheService } from '@metacult/backend/infrastructure';

interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export class IgdbProvider {
    private clientId = process.env['IGDB_CLIENT_ID'] || '';
    private clientSecret = process.env['IGDB_CLIENT_SECRET'] || '';
    private authUrl = 'https://id.twitch.tv/oauth2/token';
    private apiUrl = 'https://api.igdb.com/v4';

    private async getAccessToken(): Promise<string | null> {
        if (!this.clientId || !this.clientSecret) {
            console.error('❌ IGDB Credentials missing');
            return null;
        }

        // Attempt to get from cache or fetch new
        return cacheService.getOrSet('igdb_access_token', async () => {
            console.log('🔄 Refreshing IGDB/Twitch Access Token...');

            const response = await fetch(
                `${this.authUrl}?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
                { method: 'POST' }
            );

            if (!response.ok) {
                throw new Error(`Auth failed: ${response.statusText}`);
            }

            const data = (await response.json()) as TwitchTokenResponse;
            return data.access_token;
        }, 5000000); // Token usually lasts ~60 days, we cache safely within that range or rely on expiration logic return
    }

    async searchGames(query: string): Promise<any[]> {
        const token = await this.getAccessToken();
        if (!token) return [];

        try {
            const response = await fetch(`${this.apiUrl}/games`, {
                method: 'POST',
                headers: {
                    'Client-ID': this.clientId,
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                },
                body: `search "${query}"; fields name, cover.url, first_release_date, summary, total_rating; limit 10;`,
            });

            if (!response.ok) throw new Error(`IGDB Search failed: ${response.statusText}`);
            return (await response.json()) as any[];
        } catch (error) {
            console.error('⚠️ IGDB Search Error:', error);
            return [];
        }
    }

    async getGameDetails(id: string): Promise<any | null> {
        const token = await this.getAccessToken();
        if (!token) return null;

        try {
            const response = await fetch(`${this.apiUrl}/games`, {
                method: 'POST',
                headers: {
                    'Client-ID': this.clientId,
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                },
                body: `fields name, cover.url, first_release_date, summary, total_rating, screenshots.url, genres.name, platforms.name, similar_games.name; where id = ${id};`,
            });

            if (!response.ok) throw new Error(`IGDB Details failed: ${response.statusText}`);
            const data = (await response.json()) as any[];
            return data[0] || null;
        } catch (error) {
            console.error('⚠️ IGDB Details Error:', error);
            return null;
        }
    }
}

export const igdbProvider = new IgdbProvider();
