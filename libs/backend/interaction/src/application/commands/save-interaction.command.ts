import { eq } from 'drizzle-orm';
import { getDbConnection } from '@metacult/backend/infrastructure';
import { userInteractions, actionEnum, sentimentEnum } from '../../infrastructure/db/interactions.schema';

const { db } = getDbConnection();

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

    return result[0];
}
