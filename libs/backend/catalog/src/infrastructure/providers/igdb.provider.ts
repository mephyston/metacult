import { redisClient, cacheService } from '@metacult/backend/infrastructure';
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
    private clientId: string;
    private clientSecret: string;
    private authUrl = 'https://id.twitch.tv/oauth2/token';
    private apiUrl = 'https://api.igdb.com/v4';

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
            console.error('❌ IGDB Credentials missing');
            return null;
        }

        // Attempt to get from cache or fetch new
        return cacheService.getOrSet('igdb_access_token', async () => {
            console.log('🔄 Rafraîchissement du Token d\'accès IGDB/Twitch...');

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

    /**
     * Recherche des jeux sur l'API IGDB.
     * Utilise le langage de requête Apicalypse.
     * 
     * @param {string} query - Terme de recherche.
     * @returns {Promise<IgdbGameRaw[]>} Liste brute des jeux.
     */
    async searchGames(query: string): Promise<IgdbGameRaw[]> {
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
            return (await response.json()) as IgdbGameRaw[];
        } catch (error) {
            console.error('⚠️ Erreur Recherche IGDB :', error);
            return [];
        }
    }

    /**
     * Récupère les détails complets d'un jeu par son ID IGDB.
     * 
     * @param {string} id - ID IGDB.
     */
    async getGameDetails(id: string): Promise<IgdbGameRaw | null> {
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
            const data = (await response.json()) as IgdbGameRaw[];
            return data[0] || null;
        } catch (error) {
            console.error('⚠️ Erreur Détails IGDB :', error);
            return null;
        }
    }

    /**
     * Alias pour `getGameDetails`.
     * Satisfait l'interface générique si besoin.
     */
    async getMedia(id: string): Promise<IgdbGameRaw | null> {
        return this.getGameDetails(id);
    }

    /**
     * Récupère les jeux tendance (Sortis récemment ou à venir).
     * Critères: -3 mois < Date < +1 mois.
     * Tri: Popularité desc.
     */
    async fetchTrending(): Promise<IgdbGameRaw[]> {
        const token = await this.getAccessToken();
        if (!token) return [];

        const now = Math.floor(Date.now() / 1000);
        const threeMonthsAgo = now - (90 * 24 * 60 * 60);
        const oneMonthAhead = now + (30 * 24 * 60 * 60);

        const body = `
            fields name, cover.url, first_release_date, summary, aggregated_rating;
            where first_release_date > ${threeMonthsAgo} & first_release_date < ${oneMonthAhead};
            sort popularity desc;
            limit 20;
        `;

        try {
            const response = await fetch(`${this.apiUrl}/games`, {
                method: 'POST',
                headers: {
                    'Client-ID': this.clientId,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                },
                body
            });

            if (!response.ok) {
                console.warn(`[IGDB Provider] Fetch trending failed: ${response.statusText}`);
                return [];
            }

            return (await response.json()) as IgdbGameRaw[];
        } catch (error) {
            console.error('⚠️ Erreur Trending IGDB :', error);
            return [];
        }
    }
}

// export const igdbProvider = new IgdbProvider(); // Removed: Use CatalogModuleFactory
