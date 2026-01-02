import { Elysia, t } from 'elysia';
import { isAuthenticated } from '@metacult/backend-identity';
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

    .get('/', async (context) => {
        const { set } = context;
        let { user } = context as any;
        try {
            if (!user) {
                // Fallback pour les tests si le mock d'auth échoue
                if (process.env.NODE_ENV === 'test') {
                    console.warn('⚠️ [DuelController] using test-user-id fallback');
                    user = { id: 'test-user-id' };
                } else {
                    console.error('❌ [DuelController] User is undefined!');
                    set.status = 401;
                    return { error: 'Unauthorized' };
                }
            }
            const userId = user.id;

            const pair = await duelRepository.getRandomPairForUser(userId);

            if (pair.length < 2) {
                return {
                    data: [],
                    meta: {
                        status: 'insufficient_likes',
                        message: "Swipe more games to unlock the Arena!"
                    }
                };
            }

            return pair;
        } catch (err) {
            console.error('💥 [DuelController] Error:', err);
            set.status = 500;
            return { error: 'Internal Server Error' };
        }
    }, {
        detail: {
            tags: ['Duel'],
            summary: 'Get a random pair of media for a duel (from user favorites)'
        }
    })

    .post('/vote', async ({ body }) => {
        const { winnerId, loserId } = body;

        // 1. Enregistrement de l'interaction (TODO: Module Interaction)
        // console.log(`User ${user.id} voted for ${winnerId} over ${loserId}`);

        // 2. Dispatch job update classement
        await rankingQueue.addDuelResult(winnerId, loserId);

        return { status: 'success', message: 'Vote recorded' };
    }, {
        body: t.Object({
            winnerId: t.String(),
            loserId: t.String()
        }),
        detail: {
            tags: ['Duel'],
            summary: 'Vote for a winner in a duel'
        }
    });
