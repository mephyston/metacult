export class GoogleBooksProvider {
    private apiKey = process.env['GOOGLE_BOOKS_API_KEY'] || '';
    private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

    async searchBooks(query: string): Promise<any[]> {
        if (!this.apiKey) return [];

        const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=10`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Provider Error [GoogleBooks]: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as { items?: any[] };
        return data.items || [];
    }

    async getBookDetails(id: string): Promise<any | null> {
        if (!this.apiKey) return null;

        const url = `${this.apiUrl}/${id}?key=${this.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Provider Error [GoogleBooks]: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as any;
    }
}

export const googleBooksProvider = new GoogleBooksProvider();
