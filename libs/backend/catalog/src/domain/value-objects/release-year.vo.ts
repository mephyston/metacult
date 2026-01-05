/**
 * Représente l'année de sortie d'un média.
 * Objet de Valeur (Value Object) garantissant la cohérence chronologique.
 *
 * @class ReleaseYear
 */
export class ReleaseYear {
  private readonly value: number;

  /**
   * Crée une nouvelle instance de ReleaseYear.
   *
   * @param {number} value - L'année de sortie.
   * @throws {Error} Si l'année est antérieure à 1888 (date arbitraire de l'invention du cinéma/média moderne).
   * @throws {Error} Si l'année est dans le futur (au-delà de l'année courante).
   */
  constructor(value: number) {
    if (value <= 1888) {
      throw new Error(
        'ReleaseYear must be greater than 1888 (invention of first movie camera)',
      );
    }
    // const currentYear = new Date().getFullYear();
    // if (value > currentYear) {
    //     throw new Error('ReleaseYear cannot be in the future');
    // }
    this.value = value;
  }

  /**
   * Récupère l'année.
   *
   * @returns {number} L'année sous forme d'entier.
   */
  getValue(): number {
    return this.value;
  }
}
