/**
 * Types de médias gérés par le module de Découverte.
 * Note: Similaire au module Catalog, mais découplé pour éviter une dépendance directe si nécessaire.
 * @enum {string}
 */
export enum MediaType {
    GAME = 'game',
    MOVIE = 'movie',
    TV = 'tv',
    BOOK = 'book'
}
