export enum WorkType {
    GAME = 'GAME',
    MOVIE = 'MOVIE',
    SHOW = 'SHOW',
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

export interface Work {
    id: string;
    type: WorkType;
    title: string;
    releaseDate: Date | null;
    globalRating: number | null;
    createdAt: Date;
}

export interface Game extends Work {
    type: WorkType.GAME;
    platform: string[]; // JSON array in DB
    developer: string | null;
    timeToBeat: number | null; // Minutes or hours? Usually hours in frontend, but let's assume raw data. User didn't specify unit, but "time_to_beat" implies duration.
}

export interface Movie extends Work {
    type: WorkType.MOVIE;
    director: string | null;
    durationMinutes: number | null;
}

export interface UserInteraction {
    userId: string;
    workId: string;
    type: InteractionType;
    value: RatingValue | null;
    comments: string | null;
}
