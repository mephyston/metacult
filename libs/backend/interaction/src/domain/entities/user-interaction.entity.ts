import type { InteractionId, UserId, MediaId } from '@metacult/shared-core';

/**
 * Type d'action qu'un utilisateur peut effectuer sur un média.
 * Ces actions génèrent des signaux pour l'algorithme de recommandation.
 */
export enum InteractionAction {
  /** Intérêt positif fort. Score positif élevé. */
  LIKE = 'LIKE',
  /** Intérêt négatif. Exclut le média des recommandations futures. */
  DISLIKE = 'DISLIKE',
  /** Intérêt futur. Sauvegarde pour plus tard (Bookmark). */
  WISHLIST = 'WISHLIST',
  /** Indifférence ou report. Le média "passe" sans signal fort. */
  SKIP = 'SKIP',
}

/**
 * Sentiment qualitatif associé à une interaction (optionnel).
 * Permet de nuancer un LIKE ou une Review.
 */
export enum InteractionSentiment {
  /** "Banger" / Chef d'œuvre. Boost maximal du score. */
  BANGER = 'BANGER',
  /** Très bon, solide. */
  GOOD = 'GOOD',
  /** Correct, sans plus. */
  OKAY = 'OKAY',
}

export interface UserInteractionProps {
  id: InteractionId;
  userId: UserId;
  mediaId: MediaId;
  action: InteractionAction;
  sentiment: InteractionSentiment | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Représente l'interaction d'un utilisateur avec un média spécifique.
 * C'est le cœur du système de feedback implicite et explicite.
 *
 * **Rôle DDD** :
 * Aggregate Root du module Interaction.
 * Chaque instance est un "Signal" atomique utilisé par le moteur de découverte.
 *
 * @example
 * ```typescript
 * const like = new UserInteraction({
 *   id: 'uuid',
 *   userId: 'user-123',
 *   mediaId: 'game-456',
 *   action: InteractionAction.LIKE,
 *   sentiment: InteractionSentiment.BANGER, // Optional nuance
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 * ```
 */
export class UserInteraction {
  public readonly id: InteractionId;
  public readonly userId: UserId;
  public readonly mediaId: MediaId;
  public readonly action: InteractionAction;
  /** Sentiment optionnel pour nuancer l'action (ex: un LIKE peut être un BANGER) */
  public readonly sentiment: InteractionSentiment | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserInteractionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.mediaId = props.mediaId;
    this.action = props.action;
    this.sentiment = props.sentiment;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
