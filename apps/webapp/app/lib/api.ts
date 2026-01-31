import { treaty } from '@elysiajs/eden';
// eslint-disable-next-line @nx/enforce-module-boundaries -- Eden Treaty requires App type from API
import type { App } from '@metacult/api';

/**
 * Eden Treaty Client
 * Provides end-to-end type safety for API calls.
 */
export const api = treaty<App>(
  import.meta.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000',
);
