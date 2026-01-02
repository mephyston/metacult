import { Queue } from 'bullmq';

export const RANKING_QUEUE_NAME = 'ranking-updates';

export interface RankingUpdateJob {
    winnerId: string;
    loserId: string;
    timestamp: string;
}

/**
 * Client d'Infrastructure pour la file d'attente de Ranking.
 * Wrapper autour de BullMQ.
 */
export class RankingQueue {
    private queue: Queue<RankingUpdateJob>;

    constructor() {
        const connection = {
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        };

        this.queue = new Queue<RankingUpdateJob>(RANKING_QUEUE_NAME, {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        });
    }

    /**
     * Ajoute un résultat de duel à la file de traitement.
     * @param winnerId ID du média gagnant
     * @param loserId ID du média perdant
     */
    public async addDuelResult(winnerId: string, loserId: string): Promise<void> {
        await this.queue.add('duel-result', {
            winnerId,
            loserId,
            timestamp: new Date().toISOString(),
        });
        console.log(`📥 [RankingQueue] Duel ajouté : ${winnerId} (Win) vs ${loserId} (Loss)`);
    }

    /**
     * Ferme la connexion à la queue (Graceful Shutdown).
     */
    public async close(): Promise<void> {
        await this.queue.close();
    }
}
