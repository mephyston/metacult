import { Elysia, t } from 'elysia';
import {
  isAuthenticated,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import { logger } from '@metacult/backend/infrastructure';
import { RankingQueue } from '../../../infrastructure/queue/ranking.queue';
import { DrizzleDuelRepository } from '../../../infrastructure/repositories/drizzle-duel.repository';

// Initialisation des dépendances (Poor man's injection pour ce module)
// Idéalement, on passerait par un conteneur ou une factory au niveau de l'app.
const duelRepository = new DrizzleDuelRepository();
const rankingQueue = new RankingQueue();

/**
 * Contrôleur pour le module Duel.
 * Expose les routes :
 * - GAP /duel : Récupérer une paire aléatoire
 * - POST /duel/vote : Voter pour un gagnant
 */
export const DuelController = new Elysia({ prefix: '/duel' })
  .use(isAuthenticated) // Protection globale du contrôleur

  .get(
    '/',
    async (context) => {
      const { request, set } = context;

      try {
        // Tentative de résolution de l'utilisateur via le helper unifié
        // Cela lancera une erreur 401 si l'utilisateur n'est pas dans le contexte
        const user = await resolveUserOrThrow(context as any);
        const userId = user.id;

        const pair = await duelRepository.getRandomPairForUser(userId);

        if (pair.length < 2) {
          return {
            data: [],
            meta: {
              status: 'insufficient_likes',
              message: 'Swipe more games to unlock the Arena!',
            },
          };
        }

        return pair;
      } catch (err: any) {
        logger.error({ err }, '[DuelController] Error');
        // Si c'est une erreur d'auth lancée par resolveUserOrThrow
        if (err.status === 401 || err.message === 'Unauthorized') {
          set.status = 401;
          return { error: 'Unauthorized' };
        }
        set.status = 500;
        return { error: 'Internal Server Error' };
      }
    },
    {
      detail: {
        tags: ['Duel'],
        summary: 'Get a random pair of media for a duel (from user favorites)',
      },
    },
  )

  .post(
    '/vote',
    async ({ body }) => {
      const { winnerId, loserId } = body;

      // 1. Enregistrement de l'interaction (TODO: Module Interaction)
      // console.log(`User ${user.id} voted for ${winnerId} over ${loserId}`);

      // 2. Dispatch job update classement
      await rankingQueue.addDuelResult(winnerId, loserId);

      return { status: 'success', message: 'Vote recorded' };
    },
    {
      body: t.Object({
        winnerId: t.String(),
        loserId: t.String(),
      }),
      detail: {
        tags: ['Duel'],
        summary: 'Vote for a winner in a duel',
      },
    },
  );
