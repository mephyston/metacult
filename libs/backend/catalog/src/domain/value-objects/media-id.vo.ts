import type { Brand } from '@metacult/shared-core';
import { asBrand } from '@metacult/shared-core';

export type MediaId = Brand<string, 'MediaId'>;

export const asMediaId = (id: string): MediaId => asBrand<MediaId>(id);
