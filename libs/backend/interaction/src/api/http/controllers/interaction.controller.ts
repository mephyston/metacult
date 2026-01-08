import { Elysia, t } from 'elysia';
import {
  isAuthenticated,
  auth,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import { logger, getDbConnection } from '@metacult/backend-infrastructure';
import { API_MESSAGES } from '@metacult/shared-core';
import { saveInteraction } from '../../../application/commands/save-interaction.command';
import { syncInteractions } from '../../../application/commands/sync-interactions.command';
import { DrizzleInteractionRepository } from '../../../infrastructure/repositories/drizzle-interaction.repository';

const { db } = getDbConnection();
const interactionRepo = new DrizzleInteractionRepository(db);

/**
 * Controller pour la gestion des interactions (likes, skips, wishlists).
 */
export const interactionController = new Elysia({ prefix: '/interactions' })
  .use(isAuthenticated) // Middleware d'authentification
  .post(
    '/',
    async (ctx) => {
      const { body, set } = ctx as any; // Cast temporaire
      try {
        // Use helper to resolve user or throw 401
        const user = await resolveUserOrThrow(ctx);

        const interaction = await saveInteraction({
          userId: user.id,
          mediaId: body.mediaId,
          action: body.action,
          sentiment: body.sentiment,
        });

        return {
          success: true,
          data: interaction,
          message: API_MESSAGES.INTERACTION.VOTE_RECORDED,
        };
      } catch (e: any) {
        logger.error(
          { err: e },
          '[InteractionController] Error saving interaction',
        );
        set.status = 500;
        return {
          success: false,
          message: API_MESSAGES.INTERACTION.SAVE_FAILED,
          error: e.message,
        };
      }
    },
    {
      body: t.Object({
        mediaId: t.String({ format: 'uuid' }),
        action: t.Union([
          t.Literal('LIKE'),
          t.Literal('DISLIKE'),
          t.Literal('WISHLIST'),
          t.Literal('SKIP'),
        ]),
        sentiment: t.Optional(
          t.Union([t.Literal('BANGER'), t.Literal('GOOD'), t.Literal('OKAY')]),
        ),
      }),
      detail: {
        tags: ['Interaction'],
        summary: 'Save User Interaction',
        description:
          'Save or update a user interaction (vote) for a specific media.',
      },
    },
  )

  .post(
    '/sync',
    async (ctx) => {
      const { body, set } = ctx as any;

      // Use helper to resolve user or throw 401
      const user = await resolveUserOrThrow(ctx);

      try {
        const results = await syncInteractions(user.id, body);
        return {
          success: true,
          synced: results.length,
          message: API_MESSAGES.INTERACTION.SYNC_SUCCESS,
        };
      } catch (e: any) {
        logger.error(
          { err: e },
          '[InteractionController] Error syncing interactions',
        );
        set.status = 500;
        return {
          success: false,
          message: API_MESSAGES.INTERACTION.SYNC_FAILED,
          error: e.message,
        };
      }
    },
    {
      body: t.Array(
        t.Object({
          mediaId: t.String({ format: 'uuid' }),
          action: t.Union([
            t.Literal('LIKE'),
            t.Literal('DISLIKE'),
            t.Literal('WISHLIST'),
            t.Literal('SKIP'),
          ]),
          sentiment: t.Optional(
            t.Union([
              t.Literal('BANGER'),
              t.Literal('GOOD'),
              t.Literal('OKAY'),
            ]),
          ),
        }),
      ),
      detail: {
        tags: ['Interaction'],
        summary: 'Sync Interactions',
        description:
          'Bulk import/sync user interactions. Skips if interaction exists and new action is SKIP.',
      },
    },
  )
  .get(
    '/user/:userId',
    async ({ params, set }) => {
      try {
        const interactions = await interactionRepo.findAllByUser(params.userId);
        return {
          success: true,
          data: interactions,
        };
      } catch (e: any) {
        logger.error(
          { err: e },
          '[InteractionController] Error fetching user interactions',
        );
        set.status = 500;
        return {
          success: false,
          message: 'Failed to fetch interactions',
          error: e.message,
        };
      }
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      detail: {
        tags: ['Interaction'],
        summary: 'Get User Interactions',
        description: 'Get all interactions for a specific user.',
      },
    },
  )
  .get(
    '/feed',
    async (ctx) => {
      const { set } = ctx;
      try {
        // Resolve user or throw 401
        const user = await resolveUserOrThrow(ctx);

        // 1. Get who we follow
        const followingIds = await interactionRepo.getFollowing(user.id);

        // 2. Get their interactions
        const feed = await interactionRepo.getFeed(followingIds);

        return {
          success: true,
          data: feed,
        };
      } catch (e: any) {
        logger.error({ err: e }, '[InteractionController] Error fetching feed');
        set.status = 500;
        return {
          success: false,
          message: 'Failed to fetch feed',
          error: e.message,
        };
      }
    },
    {
      detail: {
        tags: ['Interaction'],
        summary: 'Get Activity Feed',
        description: 'Get recent interactions from followed users.',
      },
    },
  );
