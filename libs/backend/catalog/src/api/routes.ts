import { Elysia, t } from 'elysia';
import type { MediaController } from './http/controllers/media.controller';
import { SearchMediaSchema, ImportMediaSchema } from './http/dtos/media.dtos';

import { MediaNotFoundInProviderError, ProviderUnavailableError, MediaAlreadyExistsError } from '../domain/errors/catalog.errors';

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
            if (error instanceof MediaNotFoundInProviderError) {
                set.status = 404;
                return { message: error.message };
            }
            if (error instanceof ProviderUnavailableError) {
                set.status = 503;
                return { message: error.message, cause: error.cause };
            }
            if (error instanceof MediaAlreadyExistsError) {
                set.status = 409;
                return { message: error.message };
            }
            console.error('[CatalogRoutes] Unhandled Error:', error);
            set.status = 500;
            return { message: 'Internal Server Error' };
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
        })
        .get('/recent', () => {
            return controller.getRecent();
        })
        .get('/:id', ({ params }) => {
            return controller.getById(params.id);
        }, {
            params: t.Object({
                id: t.String()
            })
        });
};
