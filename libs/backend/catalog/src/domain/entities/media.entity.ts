import type { ProviderMetadata } from '../types/provider-responses';

export enum MediaType {
    GAME = 'GAME',
    MOVIE = 'MOVIE',
    TV = 'TV',
    BOOK = 'BOOK',
}

export enum InteractionType {
    RATING = 'RATING',
    BACKLOG = 'BACKLOG',
    DUEL_WIN = 'DUEL_WIN',
    DUEL_LOSS = 'DUEL_LOSS',
}

export enum RatingValue {
    MASTERPIECE = 4,
    RECOMMENDED = 3,
    MEH = 2,
    SKIP = 1,
}

export interface Media {
    id: string;
    type: MediaType;
    title: string;
    releaseDate: Date | null;
    globalRating: number | null;
    providerMetadata?: ProviderMetadata;
    createdAt: Date;
}

export interface Game extends Media {
    type: MediaType.GAME;
    platform: string[]; // JSON array in DB
    developer: string | null;
    timeToBeat: number | null;
}

export interface Movie extends Media {
    type: MediaType.MOVIE;
    director: string | null;
    durationMinutes: number | null;
}

export interface TV extends Media {
    type: MediaType.TV;
    creator: string | null;
    episodesCount: number | null;
    seasonsCount: number | null;
}

export interface Book extends Media {
    type: MediaType.BOOK;
    author: string | null;
    pages: number | null;
}

export interface UserInteraction {
    userId: string;
    mediaId: string;
    type: InteractionType;
    value: RatingValue | null;
    comments: string | null;
}
