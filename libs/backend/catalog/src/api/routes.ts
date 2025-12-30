import { Elysia, t } from 'elysia';
import type { MediaController } from './http/controllers/media.controller';
import { SearchMediaSchema, ImportMediaSchema } from './http/dtos/media.dtos';

// ✅ Factory Pattern: Routes acceptent le controller en paramètre
/**
 * Crée le routeur Elysia pour le module Catalogue.
 * Définit les endpoints HTTP et la validation des entrées.
 * 
 * @param {MediaController} controller - Contrôleur injecté.
 * @returns {Elysia} instance router.
 */
export const createCatalogRoutes = (controller: MediaController) => {
    return new Elysia({ prefix: '/media' })
        .onError(({ code, error, set }) => {
            if (code === 'VALIDATION') {
                set.status = 400;
                return { message: 'Validation Error', details: error };
            }
        })
        .get('/search', ({ query }) => {
            // Note: En Elysia, la validation 'query' spread-ée peut nécessiter une adaptation si on passe le DTO complet
            // Ici on extrait manuellement pour passer au controller
            return controller.search(query);
        }, {
            query: SearchMediaSchema.properties.query
        })
        .post('/import', ({ body }) => {
            return controller.import(body);
        }, {
            body: ImportMediaSchema.properties.body
        });
};
