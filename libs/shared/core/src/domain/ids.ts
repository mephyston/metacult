import type { Brand } from '../types/branded';
import { asBrand } from '../types/branded';

export type MediaId = Brand<string, 'MediaId'>;
export const asMediaId = (id: string) => asBrand<MediaId>(id);

export type UserId = Brand<string, 'UserId'>;
export const asUserId = (id: string) => asBrand<UserId>(id);

export type InteractionId = Brand<string, 'InteractionId'>;
export const asInteractionId = (id: string) => asBrand<InteractionId>(id);

export type DuelId = Brand<string, 'DuelId'>;
export const asDuelId = (id: string) => asBrand<DuelId>(id);

export type FollowId = Brand<string, 'FollowId'>;
export const asFollowId = (id: string) => asBrand<FollowId>(id);
