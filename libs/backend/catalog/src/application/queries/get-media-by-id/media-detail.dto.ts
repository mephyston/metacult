export interface MediaDetailDto {
    id: string;
    slug: string; // Added slug
    title: string;
    type: 'GAME' | 'MOVIE' | 'TV' | 'BOOK';
    releaseYear: number | null;
    posterUrl: string | null;
    rating: number | null;
    description: string | null;
    tags: Array<{ id: string; label: string; slug: string }>;
    metadata: Record<string, any>;
}
