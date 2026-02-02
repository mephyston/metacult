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
}

/**
 * Racine de l'Agrégat (Aggregate Root) "Media".
 * Représente une œuvre culturelle générique. C'est l'entité centrale du module Catalog.
 *
 * **Design Pattern** :
 * Polychic Aggregate. `Media` est la classe de base abstraite, étendue par des types concrets (Game, Movie...).
 *
 * **Role** :
 * Sert de pivot pour les relations (Interactions, Reviews) sans se soucier du type spécifique.
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
  /** Référence externe (IGDB, TMDB...) garantissant l'unicité de la source. */
  public readonly externalReference: ExternalReference;

  protected constructor(props: MediaProps) {
    this.id = props.id;
    this.title = props.title;
    this.slug = props.slug;
    this.description = props.description;
    this.type = props.type;
    this.coverUrl = props.coverUrl;
    this.rating = props.rating;
    this.releaseYear = props.releaseYear;
    this.externalReference = props.externalReference;
  }
}

export interface GameProps extends Omit<MediaProps, 'type'> {
  platform: string[];
  developer: string | null;
  timeToBeat: number | null;
}

/**
 * Représente un Jeu Vidéo.
 * Étend l'entité Media avec des propriétés spécifiques au gaming (HLTB, plateformes).
 *
 * @class Game
 * @extends Media
 */
export class Game extends Media {
  public readonly platform: string[];
  public readonly developer: string | null;
  /** Temps moyen pour finir le jeu (en heures). Source : HLTB. */
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
