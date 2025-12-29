import type { ProviderMetadata } from '../types/provider-responses';

import { Rating } from '../value-objects/rating.vo';
import { CoverUrl } from '../value-objects/cover-url.vo';
import { ReleaseYear } from '../value-objects/release-year.vo';

export enum MediaType {
    GAME = 'game',
    MOVIE = 'movie',
    TV = 'tv',
    BOOK = 'book'
}

export class Media {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string | null,
        public readonly type: MediaType,
        public readonly coverUrl: CoverUrl | null,
        public readonly rating: Rating | null,
        public readonly releaseYear: ReleaseYear | null,
        public readonly providerId: string
    ) { }
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


export class Game extends Media {
    constructor(
        id: string,
        title: string,
        description: string | null,
        coverUrl: CoverUrl | null,
        rating: Rating | null,
        releaseYear: ReleaseYear | null,
        providerId: string,
        public readonly platform: string[],
        public readonly developer: string | null,
        public readonly timeToBeat: number | null
    ) {
        super(id, title, description, MediaType.GAME, coverUrl, rating, releaseYear, providerId);
    }
}

export class Movie extends Media {
    constructor(
        id: string,
        title: string,
        description: string | null,
        coverUrl: CoverUrl | null,
        rating: Rating | null,
        releaseYear: ReleaseYear | null,
        providerId: string,
        public readonly director: string | null,
        public readonly durationMinutes: number | null
    ) {
        super(id, title, description, MediaType.MOVIE, coverUrl, rating, releaseYear, providerId);
    }
}

export class TV extends Media {
    constructor(
        id: string,
        title: string,
        description: string | null,
        coverUrl: CoverUrl | null,
        rating: Rating | null,
        releaseYear: ReleaseYear | null,
        providerId: string,
        public readonly creator: string | null,
        public readonly episodesCount: number | null,
        public readonly seasonsCount: number | null
    ) {
        super(id, title, description, MediaType.TV, coverUrl, rating, releaseYear, providerId);
    }
}

export class Book extends Media {
    constructor(
        id: string,
        title: string,
        description: string | null,
        coverUrl: CoverUrl | null,
        rating: Rating | null,
        releaseYear: ReleaseYear | null,
        providerId: string,
        public readonly author: string | null,
        public readonly pages: number | null
    ) {
        super(id, title, description, MediaType.BOOK, coverUrl, rating, releaseYear, providerId);
    }
}

export interface UserInteraction {
    userId: string;
    mediaId: string;
    type: InteractionType;
    value: RatingValue | null;
    comments: string | null;
}
