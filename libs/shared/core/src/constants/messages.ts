/**
 * API Response Messages
 * Centralized messages for API responses to avoid magic strings
 */
export const API_MESSAGES = {
  INTERACTION: {
    VOTE_RECORDED: 'Vote recorded successfully',
    SYNC_SUCCESS: 'Interactions synced successfully',
    CREATED: 'Interaction created successfully',
    SAVE_FAILED: 'Failed to save interaction',
    SYNC_FAILED: 'Failed to sync interactions',
  },
  DUEL: {
    VOTE_REGISTERED: 'Duel vote registered',
    INSUFFICIENT_LIKES: 'Not enough liked media to start a duel',
    PAIR_GENERATED: 'Duel pair generated successfully',
  },
  AUTH: {
    UNAUTHORIZED: 'You must be logged in',
    UNAUTHORIZED_SHORT: 'Unauthorized',
    AUTH_REQUIRED: 'Valid authentication required',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    SESSION_REFRESHED: 'Session refreshed',
  },
  MEDIA: {
    IMPORT_SUCCESS: 'Media imported successfully',
    ALREADY_EXISTS: 'Media already exists',
    NOT_FOUND: 'Media not found',
    SEARCH_SUCCESS: 'Search completed successfully',
  },
  DISCOVERY: {
    FEED_GENERATED: 'Discovery feed generated',
  },
  DEBUG: {
    SYNC_JOB_TRIGGERED: 'Sync job triggered',
  },
  ERRORS: {
    VALIDATION_FAILED: 'Validation failed',
    ROUTE_NOT_FOUND: 'Route not found',
    INTERNAL_SERVER_ERROR: 'An internal server error occurred',
    INTERNAL_ERROR_SHORT: 'Internal Server Error',
    UNHANDLED_ERROR: 'Unhandled Server Error',
    INVALID_LIMIT: 'Invalid limit parameter. Must be between 1 and 100.',
    INVALID_RESPONSE_FORMAT: 'Invalid response format',
    FETCH_FAILED: 'Failed to fetch data',
  },
  VALIDATION: {
    // IGDB
    IGDB_NOT_OBJECT: "La réponse n'est pas un objet",
    IGDB_INVALID_ID: 'Champ manquant ou invalide : id (attendu : number)',
    IGDB_INVALID_NAME:
      'Champ manquant ou invalide : name (attendu : string non vide)',
    IGDB_INVALID_RATING: 'Champ invalide : rating (attendu : number ou null)',
    IGDB_INVALID_RELEASE_DATE:
      'Champ invalide : first_release_date (attendu : number ou null)',
    IGDB_INVALID_PLATFORMS:
      'Champ invalide : platforms (attendu : array ou null)',

    // TMDB
    TMDB_NOT_OBJECT: "La réponse n'est pas un objet",
    TMDB_INVALID_ID: 'Champ manquant ou invalide : id (attendu : number)',
    TMDB_INVALID_TITLE:
      'Champ manquant ou invalide : title (attendu : string non vide)',
    TMDB_INVALID_NAME:
      'Champ manquant ou invalide : name (attendu : string non vide)',
    TMDB_INVALID_MEDIA_TYPE_MOVIE: 'media_type invalide (attendu : "movie")',
    TMDB_INVALID_MEDIA_TYPE_TV: 'media_type invalide (attendu : "tv")',
    TMDB_INVALID_VOTE_AVERAGE:
      'Champ invalide : vote_average (attendu : number ou null)',

    // Google Books
    GOOGLE_BOOKS_NOT_OBJECT: 'Response is not an object',
    GOOGLE_BOOKS_INVALID_ID:
      'Missing or invalid field: id (expected non-empty string)',
    GOOGLE_BOOKS_INVALID_VOLUME_INFO:
      'Missing or invalid field: volumeInfo (expected object)',
    GOOGLE_BOOKS_INVALID_TITLE:
      'Missing or invalid field: volumeInfo.title (expected non-empty string)',
    GOOGLE_BOOKS_INVALID_AUTHORS:
      'Invalid field: volumeInfo.authors (expected array or null)',
  },
} as const;

// Type for autocomplete
export type ApiMessageKey = keyof typeof API_MESSAGES;
export type ApiMessage<T extends ApiMessageKey> =
  keyof (typeof API_MESSAGES)[T];
