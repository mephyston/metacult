/**
 * Type declarations for Nuxt i18n
 * Auto-imported by @nuxtjs/i18n module
 */

declare module '#app' {
  interface NuxtApp {
    $t: (key: string, params?: Record<string, any>) => string;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (key: string, params?: Record<string, any>) => string;
  }
}

// Global auto-imports from Nuxt
declare global {
  const useI18n: () => {
    t: (key: string, params?: Record<string, any>) => string;
    locale: import('vue').Ref<string>;
  };
  
  const useRuntimeConfig: () => {
    public: {
      apiUrl: string;
    };
    internalApiUrl?: string;
  };
}

export {};
