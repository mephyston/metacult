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
}

// export const googleBooksProvider = new GoogleBooksProvider(); // Removed: Use CatalogModuleFactory
