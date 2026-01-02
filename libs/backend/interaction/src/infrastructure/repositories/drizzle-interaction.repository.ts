import { eq, and, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IInteractionRepository } from '../../application/ports/interaction.repository.interface';
import { UserInteraction, InteractionAction, InteractionSentiment } from '../../domain/entities/user-interaction.entity';
import { userInteractions, actionEnum, sentimentEnum } from '../db/interactions.schema';

export class DrizzleInteractionRepository implements IInteractionRepository {
    constructor(private readonly db: NodePgDatabase<any>) { }

    async save(interaction: UserInteraction): Promise<void> {
        await this.db.insert(userInteractions).values({
            id: interaction.id,
            userId: interaction.userId,
            mediaId: interaction.mediaId,
            action: interaction.action,
            sentiment: interaction.sentiment,
            createdAt: interaction.createdAt,
            updatedAt: interaction.updatedAt
        }).onConflictDoUpdate({
            target: [userInteractions.userId, userInteractions.mediaId],
            set: {
                action: interaction.action,
                sentiment: interaction.sentiment,
                updatedAt: new Date()
            }
        });
    }

    async findByUserAndMedia(userId: string, mediaId: string): Promise<UserInteraction | null> {
        const result = await this.db.select()
            .from(userInteractions)
            .where(and(eq(userInteractions.userId, userId), eq(userInteractions.mediaId, mediaId)))
            .limit(1);

        if (result.length === 0) return null;
        return this.mapToEntity(result[0]);
    }

    async findAllByUser(userId: string): Promise<UserInteraction[]> {
        const results = await this.db.select()
            .from(userInteractions)
            .where(eq(userInteractions.userId, userId));

        return results.map(this.mapToEntity);
    }

    async getSwipedMediaIds(userId: string): Promise<string[]> {
        const results = await this.db.select({ mediaId: userInteractions.mediaId })
            .from(userInteractions)
            .where(and(
                eq(userInteractions.userId, userId),
                // Exclure la Wishlist car ces items peuvent réapparaître dans d'autres contextes (mais pas en Swipe pur, à voir selon règles produit. 
                // La demande est explicite: "à l'exception de la Wishlist")
                // En SQL: AND action != 'WISHLIST'
                // Note: Drizzle `ne` means Not Equal
                sql`${userInteractions.action} != 'WISHLIST'`
            ));

        return results.map(r => r.mediaId);
    }

    private mapToEntity(raw: any): UserInteraction {
        return new UserInteraction(
            raw.id,
            raw.userId,
            raw.mediaId,
            raw.action as InteractionAction,
            raw.sentiment as InteractionSentiment | null,
            raw.createdAt,
            raw.updatedAt
        );
    }
}
