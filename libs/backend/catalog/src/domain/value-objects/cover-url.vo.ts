/**
 * Représente l'URL de la couverture (affiche/jaquette) d'un média.
 * Garantit que l'URL est sécurisée (HTTPS).
 *
 * @class CoverUrl
 */
export class CoverUrl {
    private readonly value: string;

    /**
     * Crée une nouvelle instance de CoverUrl.
     *
     * @param {string} value - L'URL de l'image.
     * @throws {Error} Si l'URL ne commence pas par 'https://'.
     */
    constructor(value: string) {
        if (!value.startsWith('https://')) {
            throw new Error('CoverUrl must be a valid URL starting with https://');
        }
        this.value = value;
    }

    /**
     * Récupère l'URL complète.
     *
     * @returns {string} L'URL sécurisée.
     */
    getValue(): string {
        return this.value;
    }
}
