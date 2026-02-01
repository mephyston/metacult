import type { InteractionId, UserId, MediaId } from '@metacult/shared-core';

export enum InteractionAction {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  WISHLIST = 'WISHLIST',
  SKIP = 'SKIP',
}

export enum InteractionSentiment {
  BANGER = 'BANGER',
  GOOD = 'GOOD',
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

export class UserInteraction {
  public readonly id: InteractionId;
  public readonly userId: UserId;
  public readonly mediaId: MediaId;
  public readonly action: InteractionAction;
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
