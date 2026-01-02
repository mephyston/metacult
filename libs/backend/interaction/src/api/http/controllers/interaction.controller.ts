import { Elysia, t } from 'elysia';
import { isAuthenticated, auth, resolveUserOrThrow } from '@metacult/backend-identity';
import { saveInteraction } from '../../../application/commands/save-interaction.command';
import { syncInteractions } from '../../../application/commands/sync-interactions.command';

/**
 * Controller pour la gestion des interactions (likes, skips, wishlists).
 */
export const interactionController = new Elysia({ prefix: '/interactions' })
    .use(isAuthenticated) // Middleware d'authentification
    .post('/', async (ctx) => {
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
            };
        } catch (e: any) {
            console.error('[InteractionController] Error saving interaction:', e);
            set.status = 500;
            return {
                success: false,
                message: 'Failed to save interaction',
                error: e.message
            };
        }
    }, {
        body: t.Object({
            mediaId: t.String({ format: 'uuid' }),
            action: t.Union([
                t.Literal('LIKE'),
                t.Literal('DISLIKE'),
                t.Literal('WISHLIST'),
                t.Literal('SKIP')
            ]),
            sentiment: t.Optional(t.Union([
                t.Literal('BANGER'),
                t.Literal('GOOD'),
                t.Literal('OKAY')
            ]))
        }),
        detail: {
            tags: ['Interaction'],
            summary: 'Save User Interaction',
            description: 'Save or update a user interaction (vote) for a specific media.'
        }
    })

    .post('/sync', async (ctx) => {
        const { body, set } = ctx as any;

        // Use helper to resolve user or throw 401
        const user = await resolveUserOrThrow(ctx);

        try {
            const results = await syncInteractions(user.id, body);
            return {
                synced: results.length
            };
        } catch (e: any) {
            console.error('[InteractionController] Error syncing interactions:', e);
            set.status = 500;
            return {
                success: false,
                message: 'Failed to sync interactions',
                error: e.message
            };
        }
    }, {
        body: t.Array(t.Object({
            mediaId: t.String({ format: 'uuid' }),
            action: t.Union([
                t.Literal('LIKE'),
                t.Literal('DISLIKE'),
                t.Literal('WISHLIST'),
                t.Literal('SKIP')
            ]),
            sentiment: t.Optional(t.Union([
                t.Literal('BANGER'),
                t.Literal('GOOD'),
                t.Literal('OKAY')
            ]))
        })),
        detail: {
            tags: ['Interaction'],
            summary: 'Sync Interactions',
            description: 'Bulk import/sync user interactions. Skips if interaction exists and new action is SKIP.'
        }
    });
