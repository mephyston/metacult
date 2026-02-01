/**
 * Port de sortie (Output Port) pour la recherche de contenus.
 * Permet au module Discovery de demander des médias (probablement au module Catalog) sans s'y coupler directement.
 *
 * @interface IMediaSearcher
 */
export interface IMediaSearcher {
  /**
   * @param {string} query - Terme de recherche.
   * @returns {Promise<any[]>} Liste de médias (typage faible 'any' temporaire, à remplacer par un DTO).
   */
  search(
    query: string,
    options?: {
      excludedIds?: string[];
      limit?: number;
      orderBy?: 'random';
      types?: string[];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]>;
}
