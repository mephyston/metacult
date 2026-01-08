import { eq } from 'drizzle-orm';
import {
  getDbConnection,
  configService,
  logger,
} from '@metacult/backend-infrastructure';
import { userInteractions } from '../../infrastructure/db/interactions.schema';
import { Queue } from 'bullmq';
import { GamificationService } from '@metacult/backend-gamification';

const { db } = getDbConnection();

const gamificationService = new GamificationService();

// Constant defined locally to avoid circular dependency with backend-discovery
const AFFINITY_QUEUE_NAME = 'affinity-queue';

// Redis Connection for Queue
const connection = {
  url: configService.get('REDIS_URL'),
};

const affinityQueue = new Queue(AFFINITY_QUEUE_NAME, { connection });

interface SaveInteractionPayload {
  userId: string;
  mediaId: string;
  action: string;
  sentiment?: string;
}

/**
 * Enregistre ou met à jour une interaction utilisateur sur un média.
 * Utilise un UPSERT basé sur le couple (userId, mediaId).
 */
export async function saveInteraction(payload: SaveInteractionPayload) {
  // Validation basique des enums (optionnelle si Zod le fait en amont, mais safe ici)
  // Note: On cast pour correspondre aux types Drizzle, Drizzle rejettera si invalide SQL mais pas TS runtime strict sans check

  // Check if sentiment is valid using type guard/check if needed, typically handled by controller validation

  const result = await db
    .insert(userInteractions)
    .values({
      userId: payload.userId,
      mediaId: payload.mediaId,
      action: payload.action as any, // Cast vers enum type
      sentiment: payload.sentiment as any,
    })
    .onConflictDoUpdate({
      target: [userInteractions.userId, userInteractions.mediaId],
      set: {
        action: payload.action as any,
        sentiment: payload.sentiment as any,
        updatedAt: new Date(),
      },
    })
    .returning();

  // Async: Trigger Affinity Update
  try {
    // Send default globalElo (1500) as placeholder.
    // Ideally the Worker/Handler should fetch the latest source-of-truth Elo from DB.
    const globalElo = 1500;

    await affinityQueue.add('update-sentiment', {
      type: 'SENTIMENT',
      userId: payload.userId,
      mediaId: payload.mediaId,
      sentiment: payload.sentiment || 'OKAY',
      globalElo: globalElo,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to publish affinity update event');
  }

  // --- GAMIFICATION: Award XP ---
  try {
    await gamificationService.addXp(payload.userId, 10, 'SWIPE');
  } catch (e) {
    logger.error({ err: e }, '[Gamification] Failed to award XP for SWIPE');
  }

  return result[0];
}
