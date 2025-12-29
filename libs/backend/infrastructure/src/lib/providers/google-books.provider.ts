export class GoogleBooksProvider {
    private apiKey = process.env['GOOGLE_BOOKS_API_KEY'] || '';
    private apiUrl = 'https://www.googleapis.com/books/v1/volumes';

    async searchBooks(query: string): Promise<any[]> {
        if (!this.apiKey) return [];

        try {
            const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=10`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`Google Books Search failed: ${response.statusText}`);

            const data = (await response.json()) as { items?: any[] };
            return data.items || [];
        } catch (error) {
            console.error('⚠️ Google Books Search Error:', error);
            return [];
        }
    }
}

export const googleBooksProvider = new GoogleBooksProvider();
