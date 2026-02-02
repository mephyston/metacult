import { Elysia, t } from 'elysia';
import {
  isAuthenticated,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import {
  SyncInteractionsHandler,
  DrizzleInteractionRepository,
} from '@metacult/backend-interaction';
import { getDbConnection, logger } from '@metacult/backend-infrastructure';

export const syncRoutes = new Elysia({ prefix: '/sync' })
  .use(isAuthenticated)
  .post(
    '/',
    async (ctx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { body, set } = ctx as any; // Elysia types can be tricky with complex nested validation

      // Resolve user
      const user = await resolveUserOrThrow(ctx);

      // Prepare results aggregator
      const results = {
        swipes: 0,
        errors: 0,
      };

      try {
        const outboxItems = body as Array<{
          type: string;
          payload: unknown;
          timestamp: number;
        }>;

        logger.info(
          { userId: user.id, itemCount: outboxItems.length },
          '[Sync] Received generic sync batch',
        );

        // --- Dispatcher Logic ---

        // 1. Group 'SWIPE' actions
        // Outbox Payload: { mediaId, action, sentiment }
        const swipeActions = outboxItems
          .filter((item) => item.type === 'SWIPE')
          .map((item) => {
            const payload = item.payload as Record<string, unknown>;
            return {
              mediaId: payload.mediaId as string,
              action: payload.action as
                | 'LIKE'
                | 'DISLIKE'
                | 'WISHLIST'
                | 'SKIP',
              sentiment: payload.sentiment as
                | 'BANGER'
                | 'GOOD'
                | 'OKAY'
                | undefined,
            };
          });

        if (swipeActions.length > 0) {
          try {
            const { db } = getDbConnection();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const repo = new DrizzleInteractionRepository(db as any);
            const handler = new SyncInteractionsHandler(repo);

            await handler.execute(user.id, swipeActions);
            results.swipes = swipeActions.length; // Assume partial success is handled internally or generic success
          } catch (err) {
            logger.error({ err }, '[Sync] Failed to process swipe subgroup');
            results.errors += 1;
            // We don't fail the whole batch if one subgroup fails, depending on strategy.
            // But for now, let's treat it as partial success or logged error.
          }
        }

        // Future: Handle 'DUEL_VOTE', etc.

        return {
          success: true,
          results,
          message: 'Sync processed successfully',
        };
      } catch (e: unknown) {
        const err = e as Error;
        logger.error({ err }, '[Sync] Fatal error processing batch');
        set.status = 500;
        return {
          success: false,
          message: 'Internal Server Error during sync',
          error: err.message,
        };
      }
    },
    {
      body: t.Array(
        t.Object({
          type: t.String(),
          payload: t.Any(),
          timestamp: t.Number(),
        }),
      ),
      detail: {
        tags: ['Sync'],
        summary: 'Process Offline Outbox',
        description:
          'Generic endpoint to process a batch of offline actions (Swipes, Votes, etc).',
      },
    },
  );
