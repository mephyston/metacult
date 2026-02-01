import type { Brand } from '@metacult/shared-core';
import { asBrand } from '@metacult/shared-core';

export type InteractionId = Brand<string, 'InteractionId'>;
export const asInteractionId = (id: string): InteractionId =>
  asBrand<InteractionId>(id);

// Follows usually use composite keys (followerId + followingId), but if they have a unique ID:
export type FollowId = Brand<string, 'FollowId'>;
export const asFollowId = (id: string): FollowId => asBrand<FollowId>(id);
