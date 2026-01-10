import { ofetch } from 'ofetch';

export default defineNuxtPlugin(() => {
  const requestId = import.meta.server
    ? useRequestHeaders(['x-request-id'])['x-request-id'] || crypto.randomUUID()
    : window.crypto.randomUUID();

  // Intercept globall $fetch
  const $fetch = ofetch.create({
    onRequest({ options }) {
      options.headers = options.headers || {};
      if (typeof options.headers === 'object' && options.headers !== null) {
        (options.headers as unknown as Record<string, string>)['x-request-id'] =
          requestId;
      }
    },
  });

  // Override global $fetch
  (globalThis as any).$fetch = $fetch;

  return {
    provide: {
      requestId,
    },
  };
});
