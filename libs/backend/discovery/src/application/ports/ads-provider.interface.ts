/**
 * Port de sortie (Output Port) pour le module Marketing.
 * Permet de récupérer des publicités à insérer dans le flux de découverte.
 *
 * @interface IAdsProvider
 */
export interface IAdsProvider {
  /**
   * @returns {Promise<any[]>} Liste de publicités (typage faible 'any' temporaire).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAds(): Promise<any[]>;
}
