/**
 * Domain Event: Interaction Saved
 * Published when a user interaction (swipe) is persisted.
 * Consumed by: Affinity Module, Gamification Module
 */
export interface InteractionSavedEventPayload {
  userId: string;
  mediaId: string;
  action: string;
  sentiment: string | null;
  timestamp: Date;
}

export class InteractionSavedEvent {
  public static readonly eventName = 'INTERACTION_SAVED';

  constructor(public readonly payload: InteractionSavedEventPayload) {}
}
