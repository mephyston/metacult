/**
 * Identifie un média de manière unique auprès d'un fournisseur externe (IGDB, TMDB, Google Books).
 * Permet de faire le lien entre le Domaine interne et les sources de données externes.
 *
 * @class ExternalReference
 */
export class ExternalReference {
    /**
     * Crée une référence externe.
     *
     * @param {string} provider - Le nom du fournisseur (ex: 'igdb', 'tmdb').
     * @param {string} id - L'identifiant unique du média chez ce fournisseur.
     * @throws {Error} Si le provider ou l'id sont vides.
     */
    constructor(
        public readonly provider: string,
        public readonly id: string
    ) {
        if (!provider) throw new Error('ExternalReference must have a provider');
        if (!id) throw new Error('ExternalReference must have an id');
    }
}
