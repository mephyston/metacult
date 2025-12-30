import type { GoogleBookRaw } from '../types/raw-responses';

export class GoogleBooksProvider {
    private apiKey: string;
    private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async searchBooks(query: string): Promise<GoogleBookRaw[]> {
        if (!this.apiKey) return [];

        const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=10`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Provider Error [GoogleBooks]: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { items?: any[] };
        return (data.items || []).map((item: any) => item as GoogleBookRaw);
    }

    async getBookDetails(id: string): Promise<GoogleBookRaw | null> {
        if (!this.apiKey) return null;

        const url = `${this.apiUrl}/${id}?key=${this.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Provider Error [GoogleBooks]: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as GoogleBookRaw;
    }
}

// export const googleBooksProvider = new GoogleBooksProvider(); // Removed: Use CatalogModuleFactory
