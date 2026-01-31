import { treaty } from '@elysiajs/eden';
// Using relative import to ensure IDE resolves the App type correctly without relying on monorepo aliases
import type { App } from '../../../api';

/**
 * Eden Treaty Client
 * Provides end-to-end type safety for API calls.
 */
export const api = treaty<App>(
    import.meta.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000',
);
