import type { GoogleBookRaw } from '../types/raw-responses';

/**
 * Provider Infrastructure pour l'API Google Books.
 * Gère la recherche et la récupération de livres.
 */
export class GoogleBooksProvider {
    private apiKey: string;
    private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Recherche de livres.
     * @param {string} query 
     */
    async searchBooks(query: string): Promise<GoogleBookRaw[]> {
        if (!this.apiKey) return [];

        const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=10`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur Provider [GoogleBooks] : ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { items?: any[] };
        return (data.items || []).map((item: any) => item as GoogleBookRaw);
    }

    /**
     * Détails d'un livre par ID.
     * @param {string} id - ID Volume Google.
     */
    async getBookDetails(id: string): Promise<GoogleBookRaw | null> {
        if (!this.apiKey) return null;

        const url = `${this.apiUrl}/${id}?key=${this.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Erreur Provider [GoogleBooks] : ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as GoogleBookRaw;
    }

    /**
     * Récupère les livres tendance via rotation de sujets.
     * Sujets: ['fiction', 'thriller', 'fantasy', 'history', 'science', 'romance'].
     * Stratégie: Sélectionne un sujet aléatoire à chaque appel.
     * Tri: newest.
     */
    async fetchTrending(): Promise<GoogleBookRaw[]> {
        if (!this.apiKey) return [];

        const subjects = ['fiction', 'thriller', 'fantasy', 'history', 'science', 'romance'];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];

        console.log(`[GoogleBooks Provider] Surfing trend subject: ${randomSubject}`);

        const url = `${this.apiUrl}?q=subject:${randomSubject}&orderBy=newest&maxResults=20&key=${this.apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`[GoogleBooks Provider] Fetch trending failed for subject ${randomSubject}: ${response.status}`);
                return [];
            }

            const data = (await response.json()) as { items?: any[] };
            return (data.items || []).map((item: any) => item as GoogleBookRaw);
        } catch (error) {
            console.error('⚠️ Erreur Trending GoogleBooks :', error);
            return [];
        }
    }
}

// export const googleBooksProvider = new GoogleBooksProvider(); // Removed: Use CatalogModuleFactory
