import { logger } from '../lib/logger';

export type FetchOptions = RequestInit & {
    timeoutMs?: number; // Default: 5000ms
    retries?: number;   // Default: 3
    externalSignal?: AbortSignal | null; // The cancellation token from the parent
};

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRIES = 3;

/**
 * A hardened fetch wrapper that handles timeouts, retries with exponential backoff,
 * and signal merging (User Cancellation + Timeout).
 */
export async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
    const {
        timeoutMs = DEFAULT_TIMEOUT,
        retries = DEFAULT_RETRIES,
        externalSignal,
        ...fetchInit
    } = options;

    let attempt = 0;

    while (attempt <= retries) {
        let timeoutId: Timer | undefined;

        // 1. Setup Timeout Controller
        const timeoutController = new AbortController();

        // 2. Setup External Signal Handling
        // We need to listen to the external signal to abort the fetch if the user cancels.
        const onExternalAbort = () => {
            timeoutController.abort(externalSignal?.reason || new Error('Aborted by user'));
        };

        if (externalSignal) {
            if (externalSignal.aborted) {
                // Already aborted, throw immediately
                throw externalSignal.reason || new Error('Aborted by user');
            }
            externalSignal.addEventListener('abort', onExternalAbort, { once: true });
        }

        try {
            // Start the timeout timer
            timeoutId = setTimeout(() => {
                timeoutController.abort(new Error(`Request timeout after ${timeoutMs}ms`));
            }, timeoutMs);

            // Perform the fetch
            // We use the timeoutController's signal for the fetch. 
            // It will trigger if:
            // a) The timeout fires
            // b) The external signal fires (which calls timeoutController.abort)
            const res = await fetch(url, {
                ...fetchInit,
                signal: timeoutController.signal,
            });

            // Valid response (even 4xx/5xx, fetch doesn't throw on status codes)
            // Check for 5xx to retry, or return if OK/4xx (client error usually shouldn't retry)
            if (res.ok || res.status < 500) {
                return res;
            }

            // If 5xx, throw to trigger retry logic
            throw new Error(`Server Error: ${res.status} ${res.statusText}`);

        } catch (error: any) {
            const isAbort = error.name === 'AbortError' || error.message?.includes('Aborted');
            const isTimeout = error.message?.includes('timeout');

            // If it's a real user abort, DO NOT RETRY.
            if (externalSignal?.aborted && isAbort) {
                throw error;
            }

            // If last attempt, throw
            if (attempt >= retries) {
                throw error;
            }

            // If it's a timeout or 5xx or network error, we retry.
            attempt++;
            const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
            logger.warn(`[fetchWithRetry] Attempt ${attempt}/${retries} failed for ${url}. Retrying in ${delay}ms...`, error.message);

            await new Promise(resolve => setTimeout(resolve, delay));

        } finally {
            // Cleanup
            clearTimeout(timeoutId);
            if (externalSignal) {
                externalSignal.removeEventListener('abort', onExternalAbort);
            }
        }
    }

    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}
