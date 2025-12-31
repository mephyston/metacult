import { ofetch } from 'ofetch';

export default defineNuxtPlugin((nuxtApp) => {
    const requestId = import.meta.server
        ? (useRequestHeaders(['x-request-id'])['x-request-id'] || crypto.randomUUID())
        : (window.crypto.randomUUID());

    // Intercept globall $fetch
    const $fetch = ofetch.create({
        onRequest({ options }: { options: any }) {
            options.headers = options.headers || {};
            (options.headers as any)['x-request-id'] = requestId;
        }
    });

    // Override global $fetch
    globalThis.$fetch = $fetch as any;

    return {
        provide: {
            requestId
        }
    }
});
