import { eq, and } from 'drizzle-orm';
import { getDbConnection, logger } from '@metacult/backend-infrastructure';
import { userInteractions } from '../../infrastructure/db/interactions.schema';

interface SyncInteractionPayload {
  mediaId: string;
  action: string;
  sentiment?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncInteractions(
  userId: string,
  interactions: SyncInteractionPayload[],
  injectedDb?: any,
) {
  const db = injectedDb || getDbConnection().db;

  // Debug checks
  if (!db) {
    logger.error('[Sync] FATAL: Database connection is undefined!');
    throw new Error('Database connection failed');
  }

  logger.info(
    { userId, count: interactions.length },
    '[Sync] Starting sync for user',
  );

  const results = [];

  for (const interaction of interactions) {
    try {
      // 1. Check existing interaction if action is SKIP
      if (interaction.action === 'SKIP') {
        const existing = await db
          .select()
          .from(userInteractions)
          .where(
            and(
              eq(userInteractions.userId, userId),
              eq(userInteractions.mediaId, interaction.mediaId),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          // Une interaction existe déjà, on ignore le SKIP
          continue;
        }
      }

      // 2. Upsert for all other cases (or SKIP if not exists)

      const result = await db
        .insert(userInteractions)
        .values({
          userId: userId,
          mediaId: interaction.mediaId,
          action: interaction.action as any,
          sentiment: interaction.sentiment as any,
        })
        .onConflictDoUpdate({
          target: [userInteractions.userId, userInteractions.mediaId],
          set: {
            action: interaction.action as any,
            sentiment: interaction.sentiment as any,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (result[0]) {
        results.push(result[0]);
      }
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      // Handle ALL errors (Select or Insert)
      // Ignore Foreign Key violations (likely due to demo/dev data with fake UUIDs)
      // Postgres Error Code 23503: foreign_key_violation
      if (error?.code === '23503') {
        logger.warn(
          { mediaId: interaction.mediaId },
          '[Sync] Skipped invalid mediaId (ForeignKeyViolation)',
        );
      } else {
        logger.error(
          { err, mediaId: interaction.mediaId },
          '[Sync] Error processing interaction',
        );
        // We choose to continue syncing others instead of failing the whole batch
      }
    }
  }

  logger.info({ syncedCount: results.length }, '[Sync] Completed sync');
  return results;
}
