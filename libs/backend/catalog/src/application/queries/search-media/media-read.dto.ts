export interface MediaReadDto {
    id: string;
    title: string;
    type: 'game' | 'movie' | 'tv' | 'book';
    coverUrl: string | null;
    rating: number | null;
    releaseYear: number | null;
    description: string | null;
}
