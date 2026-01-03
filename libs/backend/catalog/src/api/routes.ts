import { Elysia, t } from 'elysia';
import type { MediaController } from './http/controllers/media.controller';
import { SearchMediaSchema, ImportMediaSchema } from './http/dtos/media.dtos';
import {
  NotFoundError,
  ConflictError,
  InfrastructureError,
} from '@metacult/shared/core';

import {
  MediaNotFoundInProviderError,
  ProviderUnavailableError,
  MediaAlreadyExistsError,
} from '../domain/errors/catalog.errors';

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
    .onError(({ error }) => {
      // Transform domain errors to HTTP errors
      if (error instanceof MediaNotFoundInProviderError) {
        throw new NotFoundError('MEDIA_NOT_FOUND_IN_PROVIDER', error.message);
      }
      if (error instanceof ProviderUnavailableError) {
        throw new InfrastructureError(
          'PROVIDER_UNAVAILABLE',
          error.message,
          error.cause,
        );
      }
      if (error instanceof MediaAlreadyExistsError) {
        throw new ConflictError('MEDIA_ALREADY_EXISTS', error.message, {
          existingId: error.internalId,
        });
      }
      // Let global error middleware handle the rest
      throw error;
    })
    .get(
      '/search',
      ({ query }) => {
        // Note: En Elysia, la validation 'query' spread-ée peut nécessiter une adaptation si on passe le DTO complet
        // Ici on extrait manuellement pour passer au controller
        return controller.search(query);
      },
      {
        query: SearchMediaSchema.properties.query,
      },
    )
    .post(
      '/import',
      ({ body }) => {
        return controller.import(body);
      },
      {
        body: ImportMediaSchema.properties.body,
      },
    )
    .get('/recent', () => {
      return controller.getRecent();
    })
    .get('/trends', () => {
      return controller.getTrends();
    })
    .get(
      '/:id',
      ({ params }) => {
        return controller.getById(params.id);
      },
      {
        params: t.Object({
          id: t.String(),
        }),
      },
    );
};
