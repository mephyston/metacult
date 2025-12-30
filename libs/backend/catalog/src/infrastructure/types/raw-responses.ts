
/** Structure brute d'un Jeu (IGDB). */
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

/** Structure brute d'un Film (TMDB). */
export interface TmdbMovieRaw {
    id: number;
    title: string;
    overview: string;
    release_date: string; // YYYY-MM-DD
    vote_average: number;
    poster_path: string | null;
    runtime?: number;
}

/** Structure brute d'une Série TV (TMDB). */
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

/** Structure brute d'un Livre (Google Books). */
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

/** Union discriminée pour stocker les métadonnées Provider en JSONB. */
export type ProviderMetadata =
    | { source: 'IGDB'; igdbId: number; gameRaw?: IgdbGameRaw; coverUrl?: string }
    | { source: 'TMDB'; tmdbId: number; mediaType: 'movie'; movieRaw?: TmdbMovieRaw; coverUrl?: string }
    | { source: 'TMDB'; tmdbId: number; mediaType: 'tv'; tvRaw?: TmdbTvRaw; coverUrl?: string }
    | { source: 'GOOGLE_BOOKS'; googleId: string; bookRaw?: GoogleBookRaw; coverUrl?: string };
