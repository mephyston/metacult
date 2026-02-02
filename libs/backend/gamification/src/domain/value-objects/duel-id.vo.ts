import type { Brand } from '@metacult/shared-core';
import { asBrand } from '@metacult/shared-core';

export type DuelId = Brand<string, 'DuelId'>;

export const asDuelId = (id: string): DuelId => asBrand<DuelId>(id);
