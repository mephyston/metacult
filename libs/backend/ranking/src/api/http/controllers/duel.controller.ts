import { Elysia, t } from 'elysia';
import {
  isAuthenticated,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import { logger } from '@metacult/backend-infrastructure';
import { API_MESSAGES, DUEL_STATUS } from '@metacult/shared-core';
import { RankingQueue } from '../../../infrastructure/queue/ranking.queue';
import { DrizzleDuelRepository } from '../../../infrastructure/repositories/drizzle-duel.repository';
import {
  GamificationService,
  DrizzleGamificationRepository,
} from '@metacult/backend-gamification';
import { getDbConnection } from '@metacult/backend-infrastructure';

// Initialisation des dépendances (Poor man's injection pour ce module)
// Idéalement, on passerait par un conteneur ou une factory au niveau de l'app.
const duelRepository = new DrizzleDuelRepository();
const rankingQueue = new RankingQueue();
// const gamificationService = new GamificationService(); // Moved to handler

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
              status: DUEL_STATUS.INSUFFICIENT_LIKES,
              message: API_MESSAGES.DUEL.INSUFFICIENT_LIKES,
            },
          };
        }

        return pair;
      } catch (err: any) {
        logger.error({ err }, '[DuelController] Error');
        // Si c'est une erreur d'auth lancée par resolveUserOrThrow
        if (
          err.status === 401 ||
          err.message === API_MESSAGES.AUTH.UNAUTHORIZED_SHORT
        ) {
          set.status = 401;
          return { error: API_MESSAGES.AUTH.UNAUTHORIZED_SHORT };
        }
        set.status = 500;
        return { error: API_MESSAGES.ERRORS.INTERNAL_ERROR_SHORT };
      }
    },
    {
      detail: {
        tags: ['Duel'],
        summary: API_MESSAGES.DOCS.DUEL.GET_PAIR_SUMMARY,
      },
    },
  )

  .post(
    '/vote',
    async (context) => {
      const { body } = context;
      const { winnerId, loserId } = body;

      const user = await resolveUserOrThrow(context);

      // 1. Dispatch job update classement
      await rankingQueue.addDuelResult(winnerId, loserId);

      // 2. GAMIFICATION: Award XP
      try {
        const { db } = getDbConnection();
        const repo = new DrizzleGamificationRepository(db as any);
        const gamificationService = new GamificationService(repo);

        await gamificationService.addXp(user.id, 50, 'DUEL');
      } catch (e) {
        logger.error({ err: e }, '[Gamification] Failed to award XP for DUEL');
      }

      return { status: 'success', message: API_MESSAGES.DUEL.VOTE_REGISTERED };
    },
    {
      body: t.Object({
        winnerId: t.String(),
        loserId: t.String(),
      }),
      detail: {
        tags: ['Duel'],
        summary: API_MESSAGES.DOCS.DUEL.VOTE_SUMMARY,
      },
    },
  );
