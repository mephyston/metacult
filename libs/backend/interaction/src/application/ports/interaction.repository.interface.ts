import type { UserInteraction, InteractionAction, InteractionSentiment } from '../../domain/entities/user-interaction.entity';

export interface IInteractionRepository {
    save(interaction: UserInteraction): Promise<void>;
    findByUserAndMedia(userId: string, mediaId: string): Promise<UserInteraction | null>;
    findAllByUser(userId: string): Promise<UserInteraction[]>;
}
