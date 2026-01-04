/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { ofetch } from 'ofetch';

export default defineNuxtPlugin(() => {
  const requestId = import.meta.server
    ? useRequestHeaders(['x-request-id'])['x-request-id'] || crypto.randomUUID()
    : window.crypto.randomUUID();

  // Intercept globall $fetch
  const $fetch = ofetch.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRequest({ options }: { options: any }) {
      options.headers = options.headers || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (options.headers as any)['x-request-id'] = requestId;
    },
  });

  // Override global $fetch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.$fetch = $fetch as any;

  return {
    provide: {
      requestId,
    },
  };
});
