import { Elysia, t } from 'elysia';
import {
  isAuthenticated,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import { logger } from '@metacult/backend-infrastructure';
import { API_MESSAGES } from '@metacult/shared-core';
import { GetUserRankingsHandler } from '../../../application/queries/get-user-rankings/get-user-rankings.handler';
import { DrizzleInteractionRepository } from '@metacult/backend-interaction';
import { DrizzleMediaRepository } from '@metacult/backend-catalog';
import { getDbConnection } from '@metacult/backend-infrastructure';

// Note: Ces repositories partagent la même instance DB que l'app principale
// On réutilise le singleton DB déjà initialisé dans apps/api/index.ts
// Pour une vraie DI, passer les repositories en paramètre via une factory

// Initialisation temporaire des dépendances
// TODO: Refactor pour utiliser une Factory qui reçoit le DB depuis le Composition Root
const { db } = getDbConnection(); // Récupère le singleton existant
const interactionRepository = new DrizzleInteractionRepository(db as any);
const mediaRepository = new DrizzleMediaRepository(db as any);
const getUserRankingsHandler = new GetUserRankingsHandler(
  interactionRepository,
  mediaRepository,
);

/**
 * Contrôleur pour le classement personnel de l'utilisateur.
 * Expose la route :
 * - GET /ranking/me : Récupérer le classement personnel basé sur l'historique ELO
 */
export const RankingController = new Elysia({ prefix: '/ranking' })
  .use(isAuthenticated) // Protection globale du contrôleur

  .get(
    '/me',
    async (context) => {
      const { query, set } = context;

      try {
        // Résolution de l'utilisateur authentifié
        const user = await resolveUserOrThrow(context as any);
        const userId = user.id;

        // Récupération de la limite depuis les query params (default: 10)
        const limit = query.limit ? parseInt(query.limit as string, 10) : 10;

        // Validation de la limite
        if (isNaN(limit) || limit < 1 || limit > 100) {
          set.status = 400;
          return {
            error: API_MESSAGES.ERRORS.INVALID_LIMIT,
          };
        }

        // Exécution de la query
        const result = await getUserRankingsHandler.execute({
          userId,
          limit,
        });

        if (result.isFailure()) {
          throw result.getError();
        }

        const rankings = result.getValue();

        return {
          data: rankings,
          meta: {
            userId,
            count: rankings.length,
            limit,
          },
        };
      } catch (err: any) {
        logger.error({ err }, '[RankingController] Error');

        // Gestion des erreurs d'authentification
        if (
          err.status === 401 ||
          err.message === API_MESSAGES.AUTH.UNAUTHORIZED_SHORT
        ) {
          set.status = 401;
          return { error: API_MESSAGES.AUTH.UNAUTHORIZED_SHORT };
        }

        // Erreur interne
        set.status = 500;
        return { error: API_MESSAGES.ERRORS.INTERNAL_ERROR_SHORT };
      }
    },
    {
      query: t.Optional(
        t.Object({
          limit: t.Optional(t.String()),
        }),
      ),
      detail: {
        tags: ['Ranking'],
        summary: 'Get personal media rankings based on ELO replay algorithm',
        description:
          'Returns the top-ranked media for the authenticated user, ' +
          'calculated by replaying all interactions (swipes and duels) chronologically ' +
          'using the ELO rating system.',
      },
    },
  );
