import type { Brand } from '@metacult/shared-core';
import { asBrand } from '@metacult/shared-core';

export type UserId = Brand<string, 'UserId'>;

export const asUserId = (id: string): UserId => asBrand<UserId>(id);
