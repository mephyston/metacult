import { Rating } from '../value-objects/rating.vo';
import { CoverUrl } from '../value-objects/cover-url.vo';
import { ReleaseYear } from '../value-objects/release-year.vo';
import { ExternalReference } from '../value-objects/external-reference.vo';

/**
 * Types de médias supportés par le système.
 * @enum {string}
 */
export enum MediaType {
  /** Jeu Vidéo */
  GAME = 'game',
  /** Film de cinéma */
  MOVIE = 'movie',
  /** Série TV */
  TV = 'tv',
  /** Livre */
  BOOK = 'book',
}

/**
 * Racine de l'Agrégat (Aggregate Root) "Media".
 * Représente une œuvre culturelle générique. C'est l'entité centrale du module Catalog.
 *
 * @class Media
 * @abstract
 */
export class Media {
  /**
   * @param {string} id - Identifiant unique interne (UUID).
   * @param {string} title - Titre du média.
   * @param {string | null} description - Synopsis ou résumé.
   * @param {MediaType} type - Type discriminé du média.
   * @param {CoverUrl | null} coverUrl - URL de l'image de couverture (Value Object).
   * @param {Rating | null} rating - Note moyenne (Value Object).
   * @param {ReleaseYear | null} releaseYear - Année de sortie (Value Object).
   * @param {ExternalReference} externalReference - Lien vers la source de données externe (Value Object).
   * @param {number} eloScore - Score ELO (défault 1500).
   * @param {number} matchCount - Nombre de matchs joués.
   */
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly type: MediaType,
    public readonly coverUrl: CoverUrl | null,
    public readonly rating: Rating | null,
    public readonly releaseYear: ReleaseYear | null,
    public readonly externalReference: ExternalReference,
    public readonly eloScore = 1500,
    public readonly matchCount = 0,
  ) {}
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

/**
 * Représente un Jeu Vidéo.
 * Étend l'entité Media avec des propriétés spécifiques au gaming.
 *
 * @class Game
 * @extends Media
 */
export class Game extends Media {
  /**
   * @param {string} id - UUID.
   * @param {string} title - Titre.
   * @param {string | null} description - Description.
   * @param {CoverUrl | null} coverUrl - Cover.
   * @param {Rating | null} rating - Note.
   * @param {ReleaseYear | null} releaseYear - Année.
   * @param {ExternalReference} externalReference - Ref IGDB.
   * @param {string[]} platform - Liste des plateformes supportées (ex: "PS5", "PC").
   * @param {string | null} developer - Studio de développement.
   * @param {number | null} timeToBeat - Temps moyen pour finir le jeu (en heures).
   */
  // Update Game
  constructor(
    id: string,
    title: string,
    slug: string,
    description: string | null,
    coverUrl: CoverUrl | null,
    rating: Rating | null,
    releaseYear: ReleaseYear | null,
    externalReference: ExternalReference,
    public readonly platform: string[],
    public readonly developer: string | null,
    public readonly timeToBeat: number | null,
    eloScore?: number,
    matchCount?: number,
  ) {
    super(
      id,
      title,
      slug,
      description,
      MediaType.GAME,
      coverUrl,
      rating,
      releaseYear,
      externalReference,
      eloScore,
      matchCount,
    );
  }
}

/**
 * Représente un Film de cinéma.
 *
 * @class Movie
 * @extends Media
 */
export class Movie extends Media {
  /**
   * @param {string} id - UUID.
   * @param {string} title - Titre.
   * @param {string} slug - Slug URL.
   * @param {string | null} description - Synopsis.
   * @param {CoverUrl | null} coverUrl - Affiche.
   * @param {Rating | null} rating - Note.
   * @param {ReleaseYear | null} releaseYear - Année.
   * @param {ExternalReference} externalReference - Ref TMDB.
   * @param {string | null} director - Réalisateur.
   * @param {number | null} durationMinutes - Durée en minutes.
   */
  constructor(
    id: string,
    title: string,
    slug: string,
    description: string | null,
    coverUrl: CoverUrl | null,
    rating: Rating | null,
    releaseYear: ReleaseYear | null,
    externalReference: ExternalReference,
    public readonly director: string | null,
    public readonly durationMinutes: number | null,
    eloScore?: number,
    matchCount?: number,
  ) {
    super(
      id,
      title,
      slug,
      description,
      MediaType.MOVIE,
      coverUrl,
      rating,
      releaseYear,
      externalReference,
      eloScore,
      matchCount,
    );
  }
}

/**
 * Représente une Série Télévisée.
 *
 * @class TV
 * @extends Media
 */
export class TV extends Media {
  /**
   * @param {string} id - UUID.
   * @param {string} title - Titre.
   * @param {string} slug - Slug URL.
   * @param {string | null} description - Synopsis.
   * @param {CoverUrl | null} coverUrl - Affiche.
   * @param {Rating | null} rating - Note.
   * @param {ReleaseYear | null} releaseYear - Année.
   * @param {ExternalReference} externalReference - Ref TMDB.
   * @param {string | null} creator - Créateur / Showrunner.
   * @param {number | null} episodesCount - Nombre total d'épisodes.
   * @param {number | null} seasonsCount - Nombre total de saisons.
   */
  constructor(
    id: string,
    title: string,
    slug: string,
    description: string | null,
    coverUrl: CoverUrl | null,
    rating: Rating | null,
    releaseYear: ReleaseYear | null,
    externalReference: ExternalReference,
    public readonly creator: string | null,
    public readonly episodesCount: number | null,
    public readonly seasonsCount: number | null,
    eloScore?: number,
    matchCount?: number,
  ) {
    super(
      id,
      title,
      slug,
      description,
      MediaType.TV,
      coverUrl,
      rating,
      releaseYear,
      externalReference,
      eloScore,
      matchCount,
    );
  }
}

/**
 * Représente un Livre.
 *
 * @class Book
 * @extends Media
 */
export class Book extends Media {
  /**
   * @param {string} id - UUID.
   * @param {string} title - Titre.
   * @param {string} slug - Slug URL.
   * @param {string | null} description - Quatrième de couverture.
   * @param {CoverUrl | null} coverUrl - Couverture.
   * @param {Rating | null} rating - Note.
   * @param {ReleaseYear | null} releaseYear - Année de publication.
   * @param {ExternalReference} externalReference - Ref Google Books.
   * @param {string | null} author - Auteur principal.
   * @param {number | null} pages - Nombre de pages.
   */
  constructor(
    id: string,
    title: string,
    slug: string,
    description: string | null,
    coverUrl: CoverUrl | null,
    rating: Rating | null,
    releaseYear: ReleaseYear | null,
    externalReference: ExternalReference,
    public readonly author: string | null,
    public readonly pages: number | null,
    eloScore?: number,
    matchCount?: number,
  ) {
    super(
      id,
      title,
      slug,
      description,
      MediaType.BOOK,
      coverUrl,
      rating,
      releaseYear,
      externalReference,
      eloScore,
      matchCount,
    );
  }
}

export interface UserInteraction {
  userId: string;
  mediaId: string;
  type: InteractionType;
  value: RatingValue | null;
  comments: string | null;
}
