/**
 * Entité Marketing représentant une publicité.
 * Simple interface car pas de logique métier complexe pour l'instant.
 * 
 * @interface Ad
 */
export interface Ad {
    id: string;
    title: string;
    type: 'SPONSORED';
    url: string;
}
