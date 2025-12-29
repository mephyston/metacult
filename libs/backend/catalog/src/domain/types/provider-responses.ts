
export interface IgdbGameRaw {
    id: number;
    name: string;
    summary?: string;
    first_release_date?: number; // Unix timestamp
    cover?: {
        id: number;
        url: string;
    };
    genres?: Array<{
        id: number;
        name: string;
    }>;
    platforms?: Array<{
        id: number;
        name: string;
    }>;
    total_rating?: number;
}

export interface TmdbMovieRaw {
    id: number;
    title: string;
    overview: string;
    release_date: string; // YYYY-MM-DD
    vote_average: number;
    poster_path: string | null;
    runtime?: number;
}

export interface TmdbTvRaw {
    id: number;
    name: string;
    overview: string;
    first_air_date: string; // YYYY-MM-DD
    vote_average: number;
    poster_path: string | null;
    number_of_seasons?: number;
    number_of_episodes?: number;
    created_by?: Array<{
        id: number;
        name: string;
    }>;
}

export interface GoogleBookRaw {
    id: string;
    volumeInfo: {
        title: string;
        description?: string;
        publishedDate?: string;
        authors?: string[];
        pageCount?: number;
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
    };
}

export type ProviderMetadata =
    | { source: 'IGDB'; igdbId: number; gameRaw: IgdbGameRaw }
    | { source: 'TMDB'; tmdbId: number; mediaType: 'movie'; movieRaw: TmdbMovieRaw }
    | { source: 'TMDB'; tmdbId: number; mediaType: 'tv'; tvRaw: TmdbTvRaw }
    | { source: 'GOOGLE_BOOKS'; googleId: string; bookRaw: GoogleBookRaw };
