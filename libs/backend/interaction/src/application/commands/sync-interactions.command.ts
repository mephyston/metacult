import { eq, and } from 'drizzle-orm';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { userInteractions } from '../../infrastructure/db/interactions.schema';

interface SyncInteractionPayload {
    mediaId: string;
    action: string;
    sentiment?: string;
}

export async function syncInteractions(
    userId: string,
    interactions: SyncInteractionPayload[],
    injectedDb?: any
) {
    const db = injectedDb || getDbConnection().db;

    // Debug checks
    if (!db) {
        console.error('[Sync] FATAL: Database connection is undefined!');
        throw new Error('Database connection failed');
    }

    console.log(`[Sync] Starting sync for user ${userId} with ${interactions.length} items.`);

    const results = [];

    for (const interaction of interactions) {
        try {
            // 1. Check existing interaction if action is SKIP
            if (interaction.action === 'SKIP') {
                const existing = await db
                    .select()
                    .from(userInteractions)
                    .where(and(
                        eq(userInteractions.userId, userId),
                        eq(userInteractions.mediaId, interaction.mediaId)
                    ))
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
        } catch (err: any) {
            // Handle ALL errors (Select or Insert)
            // Ignore Foreign Key violations (likely due to demo/dev data with fake UUIDs)
            // Postgres Error Code 23503: foreign_key_violation
            if (err?.code === '23503') {
                console.warn(`[Sync] Skipped invalid mediaId (ForeignKeyViolation): ${interaction.mediaId}`);
            } else {
                console.error(`[Sync] Error processing interaction for ${interaction.mediaId}:`, err);
                // We choose to continue syncing others instead of failing the whole batch
            }
        }
    }

    console.log(`[Sync] Completed. Synced ${results.length} items.`);
    return results;
}
