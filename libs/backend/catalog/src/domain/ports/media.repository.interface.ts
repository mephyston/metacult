import type { MediaId } from '../value-objects/media-id.vo';
import type { Media, MediaType } from '../entities/media.entity';

/**
 * Filtres de recherche pour le catalogue de médias.
 * @interface MediaSearchFilters
 */
export interface MediaSearchFilters {
  /** Filtrer par type de média (Jeu, Film, etc.) */
  type?: MediaType;
  /** Recherche par slug (tag) */
  tag?: string;
  /** Recherche textuelle (titre) */
  search?: string;
  /** IDs à exclure (Blacklist/Déjà vus) */
  excludedIds?: string[];
  /** Limite de résultats (pagination/feed) */
  limit?: number;
  /** Tri des résultats */
  orderBy?: 'random' | 'recent' | 'popularity';
  /** Année de sortie (Filtre Strict) */
  releaseYear?: number;
  /** Score Elo Minimum */
  minElo?: number;
  /** Tags (ex: 'sci-fi', 'horror') */
  tags?: string[];
  /** Pagination : Page actuelle (1-indexed) */
  page?: number;
}

import type { MediaReadModel } from '../read-models/media-read.model';

/**
 * Port de sortie (Output Port) pour la persistance des médias.
 * Définit le contrat que l'infrastructure (Database) doit implémenter.
 *
 * @interface IMediaRepository
 */
export interface IMediaRepository {
  /**
   * Recherche un média par son identifiant unique interne.
   * @param {string} id - UUID du média.
   * @returns {Promise<Media | null>} L'entité Média ou null si non trouvée.
   */
  findById(id: MediaId): Promise<Media | null>;

  /**
   * Recherche un média par son slug URL.
   * @param {string} slug - Slug unique.
   * @returns {Promise<Media | null>} L'entité Média ou null si non trouvée.
   */
  findBySlug(slug: string): Promise<Media | null>;

  /**
   * Recherche des médias correspondant aux filtres.
   * @param {MediaSearchFilters} filters - Critères de recherche.
   * @returns {Promise<Media[]>} Liste d'entités du domaine.
   */
  search(filters: MediaSearchFilters): Promise<Media[]>;

  /**
   * Recherche avancée avec pagination et filtres complexes.
   * (Mode B : DB Locale uniquement)
   * @param {MediaSearchFilters} filters
   * @returns {Promise<{ items: Media[]; total: number }>}
   */
  searchAdvanced(
    filters: MediaSearchFilters,
  ): Promise<{ items: Media[]; total: number }>;

  /**
   * Recherche optimisée pour la lecture (CQRS).
   * @param {MediaSearchFilters} filters - Critères.
   * @returns {Promise<MediaReadDto[]>} Liste de DTOs légers pour l'affichage.
   */
  searchViews(filters: MediaSearchFilters): Promise<MediaReadModel[]>;

  /**
   * Persiste un nouveau média.
   * @param {Media} media - L'entité à sauvegarder.
   * @returns {Promise<void>}
   */
  create(media: Media): Promise<void>;

  /**
   * Recherche un média par sa référence externe (Provider + ID externe).
   * Utile pour éviter les doublons lors des imports.
   *
   * @param {string} provider - Nom du fournisseur (ex: 'igdb').
   * @param {string} externalId - ID chez le fournisseur.
   * @returns {Promise<Media | null>}
   */
  findByProviderId(provider: string, externalId: string): Promise<Media | null>;

  /**
   * Génère un nouvel identifiant unique (UUID).
   * @returns {string} Un nouvel UUID.
   */
  /**
   * Récupère les médias les plus récents.
   * @param limit Nombre de médias à récupérer.
   */
  findMostRecent(limit: number): Promise<MediaReadModel[]>;

  /**
   * Récupère des médias aléatoires en respectant les filtres.
   */
  findRandom(filters: MediaSearchFilters): Promise<MediaReadModel[]>;

  /**
   * Récupère les médias les mieux notés (Top ELO).
   * @param limit Nombre de médias à récupérer.
   */
  findTopRated(limit: number): Promise<MediaReadModel[]>;

  nextId(): string;
}
