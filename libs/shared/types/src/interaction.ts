/**
 * Types of interactions a user can have with a media.
 */
export enum InteractionType {
    RATING = 'RATING',
    BACKLOG = 'BACKLOG',
    DUEL_WIN = 'DUEL_WIN',
    DUEL_LOSS = 'DUEL_LOSS',
}

/**
 * Numeric values for ratings.
 */
export enum RatingValue {
    MASTERPIECE = 4,
    RECOMMENDED = 3,
    MEH = 2,
    SKIP = 1,
}
