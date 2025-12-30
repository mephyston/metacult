/**
 * Représente un objet de valeur (Value Object) pour la note d'un média.
 * Garantit que la note est quantitativement valide (entre 0 et 10).
 *
 * @class Rating
 * @packageDocumentation
 */
export class Rating {
    private readonly value: number;

    /**
     * Crée une nouvelle instance de Rating.
     *
     * @param {number} value - La note attribuée (doit être un nombre).
     * @throws {Error} Si la note est inférieure à 0 ou supérieure à 10.
     */
    constructor(value: number) {
        if (value < 0 || value > 10) {
            throw new Error('Rating must be between 0 and 10');
        }
        this.value = value;
    }

    /**
     * Récupère la valeur primitive de la note.
     *
     * @returns {number} La note sous forme de nombre.
     */
    getValue(): number {
        return this.value;
    }
}
