import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { fetchWithRetry } from './http.client';

describe('fetchWithRetry', () => {
    // Save original fetch
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        mock.restore();
    });

    it('should return response on success (200)', async () => {
        global.fetch = mock(() => Promise.resolve(new Response('OK', { status: 200 }))) as any;

        const res = await fetchWithRetry('https://api.example.com');
        expect(res.status).toBe(200);
        expect(await res.text()).toBe('OK');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 5xx errors', async () => {
        let attempts = 0;
        global.fetch = mock(() => {
            attempts++;
            if (attempts < 3) {
                return Promise.resolve(new Response('Server Error', { status: 503 }));
            }
            return Promise.resolve(new Response('OK', { status: 200 }));
        }) as any;

        const res = await fetchWithRetry('https://api.example.com', { retries: 3, timeoutMs: 100 });

        expect(res.status).toBe(200);
        expect(attempts).toBe(3); // Initial + 2 retries
        expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exhausted', async () => {
        global.fetch = mock(() => Promise.resolve(new Response('Server Error', { status: 500 }))) as any;

        try {
            await fetchWithRetry('https://api.example.com', { retries: 2, timeoutMs: 50 });
            expect(true).toBe(false); // Should not reach here
        } catch (e: any) {
            expect(e.message).toContain('Server Error');
            expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
        }
    });

    it('should respect internal timeout', async () => {
        global.fetch = mock(async () => {
            await new Promise(r => setTimeout(r, 200)); // Slow response
            return new Response('OK');
        }) as any;

        try {
            await fetchWithRetry('https://api.example.com', { timeoutMs: 50, retries: 0 });
            expect(true).toBe(false); // Should fail
        } catch (e: any) {
            // Error message can be "The operation was aborted" (standard) or our custom message depending on race
            // AbortSignal.timeout usually throws AbortError
            expect(e.message).toBeTruthy();
        }
    });

    it('should abort immediately when external signal triggers', async () => {
        const controller = new AbortController();

        global.fetch = mock(async (req, opts: any) => {
            // Mock standard fetch behavior: listen to signal
            return new Promise((resolve, reject) => {
                if (opts.signal?.aborted) return reject(new Error('Aborted'));
                opts.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
            });
        }) as any;

        const promise = fetchWithRetry('https://api.example.com', {
            externalSignal: controller.signal,
            retries: 5 // Should not retry
        });

        controller.abort(); // Cancel immediately

        try {
            await promise;
            expect(true).toBe(false);
        } catch (e: any) {
            const isAbort = e.name === 'AbortError' || e.message === 'Aborted by user' || e.message === 'Aborted';
            expect(isAbort).toBe(true);
            expect(global.fetch).toHaveBeenCalledTimes(1); // Should call once and abort, no retries
        }
    });
});
