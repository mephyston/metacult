import type { Media, MediaType } from '../../domain/entities/media.entity';

/**
 * Port de sortie (Output Port) pour les fournisseurs de données externes.
 * Définit le contrat pour récupérer les métadonnées depuis des sources tierces (IGDB, TMDB, Google Books).
 *
 * @interface IMediaProvider
 */
export interface IMediaProvider {
  /**
   * Récupère les données brutes depuis la source externe et les mappe vers une Entité du Domaine.
   * L'implémentation (Adapter) est responsable de tout le mapping et la normalisation.
   *
   * @param {string} id - Identifiant externe du média.
   * @param {MediaType} type - Type de média attendu.
   * @param {string} [targetId] - ID interne à assigner au média créé (optionnel).
   * @returns {Promise<Media | null>} L'entité hydratée ou null si introuvable.
   */
  getMedia(
    id: string,
    type: MediaType,
    targetId?: string,
  ): Promise<Media | null>;

  /**
   * Recherche des médias par requête textuelle.
   */
  search(query: string): Promise<Media[]>;
}
