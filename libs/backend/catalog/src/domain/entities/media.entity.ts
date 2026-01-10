import type { MediaId } from '../value-objects/media-id.vo';
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

export interface MediaProps {
  id: MediaId;
  title: string;
  slug: string;
  description: string | null;
  type: MediaType;
  coverUrl: CoverUrl | null;
  rating: Rating | null;
  releaseYear: ReleaseYear | null;
  externalReference: ExternalReference;
  eloScore?: number;
  matchCount?: number;
}

/**
 * Racine de l'Agrégat (Aggregate Root) "Media".
 * Représente une œuvre culturelle générique. C'est l'entité centrale du module Catalog.
 *
 * @class Media
 * @abstract
 */
export abstract class Media {
  public readonly id: MediaId;
  public readonly title: string;
  public readonly slug: string;
  public readonly description: string | null;
  public readonly type: MediaType;
  public readonly coverUrl: CoverUrl | null;
  public readonly rating: Rating | null;
  public readonly releaseYear: ReleaseYear | null;
  public readonly externalReference: ExternalReference;
  public readonly eloScore: number;
  public readonly matchCount: number;

  constructor(props: MediaProps) {
    this.id = props.id;
    this.title = props.title;
    this.slug = props.slug;
    this.description = props.description;
    this.type = props.type;
    this.coverUrl = props.coverUrl;
    this.rating = props.rating;
    this.releaseYear = props.releaseYear;
    this.externalReference = props.externalReference;
    this.eloScore = props.eloScore ?? 1500;
    this.matchCount = props.matchCount ?? 0;
  }
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

export interface GameProps extends Omit<MediaProps, 'type'> {
  platform: string[];
  developer: string | null;
  timeToBeat: number | null;
}

/**
 * Représente un Jeu Vidéo.
 * Étend l'entité Media avec des propriétés spécifiques au gaming.
 *
 * @class Game
 * @extends Media
 */
export class Game extends Media {
  public readonly platform: string[];
  public readonly developer: string | null;
  public readonly timeToBeat: number | null;

  constructor(props: GameProps) {
    super({ ...props, type: MediaType.GAME });
    this.platform = props.platform;
    this.developer = props.developer;
    this.timeToBeat = props.timeToBeat;
  }
}

export interface MovieProps extends Omit<MediaProps, 'type'> {
  director: string | null;
  durationMinutes: number | null;
}

/**
 * Représente un Film de cinéma.
 *
 * @class Movie
 * @extends Media
 */
export class Movie extends Media {
  public readonly director: string | null;
  public readonly durationMinutes: number | null;

  constructor(props: MovieProps) {
    super({ ...props, type: MediaType.MOVIE });
    this.director = props.director;
    this.durationMinutes = props.durationMinutes;
  }
}

export interface TVProps extends Omit<MediaProps, 'type'> {
  creator: string | null;
  episodesCount: number | null;
  seasonsCount: number | null;
}

/**
 * Représente une Série Télévisée.
 *
 * @class TV
 * @extends Media
 */
export class TV extends Media {
  public readonly creator: string | null;
  public readonly episodesCount: number | null;
  public readonly seasonsCount: number | null;

  constructor(props: TVProps) {
    super({ ...props, type: MediaType.TV });
    this.creator = props.creator;
    this.episodesCount = props.episodesCount;
    this.seasonsCount = props.seasonsCount;
  }
}

export interface BookProps extends Omit<MediaProps, 'type'> {
  author: string | null;
  pages: number | null;
}

/**
 * Représente un Livre.
 *
 * @class Book
 * @extends Media
 */
export class Book extends Media {
  public readonly author: string | null;
  public readonly pages: number | null;

  constructor(props: BookProps) {
    super({ ...props, type: MediaType.BOOK });
    this.author = props.author;
    this.pages = props.pages;
  }
}

export interface UserInteraction {
  userId: string;
  mediaId: string;
  type: InteractionType;
  value: RatingValue | null;
  comments: string | null;
}
