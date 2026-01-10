import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DEFAULT_DEV_URLS } from '@metacult/shared-core';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Support for Node.js process environment in shared code
// Support for Node.js process environment in shared code
declare const process: { env: Record<string, string | undefined> };

// Support for Runtime Config (injected via window.__ENV__ in Layout.astro)
declare global {
  interface Window {
    __ENV__?: {
      PUBLIC_WEBAPP_URL?: string;
      PUBLIC_WEBSITE_URL?: string;
      PUBLIC_API_URL?: string;
    };
  }
}

export function getApiUrl(): string {
  // Priority:
  // 1. Window Runtime Config (Browser Hydration - Astro)
  // 2. Process Env (Node/SSR Runtime)
  // 3. Import Meta (Build Time)

  let rawApiUrl: string | undefined;

  if (typeof window !== 'undefined') {
    // 1. Runtime Config (injected by Astro Layout)
    if (window.__ENV__?.PUBLIC_API_URL) {
      rawApiUrl = window.__ENV__.PUBLIC_API_URL;
    }
  }

  // 2. Process Env (Node/SSR)
  if (!rawApiUrl && typeof process !== 'undefined') {
    // A. Priority to Explicit Internal URLs (We set these manually with correct Port)
    if (process.env['INTERNAL_API_URL']) {
      rawApiUrl = process.env['INTERNAL_API_URL'];
    } else if (process.env['NUXT_INTERNAL_API_URL']) {
      rawApiUrl = process.env['NUXT_INTERNAL_API_URL'];
    }
    // B. Fallback to Railway Auto-Injected API_URL
    // WARNING: This often lacks the port (80 vs 8080), so we prefer the variables above.
    else if (process.env['API_URL']) {
      let internalUrl = process.env['API_URL'];

      // Ensure protocol
      if (!internalUrl.startsWith('http')) {
        internalUrl = `http://${internalUrl}`;
      }

      rawApiUrl = internalUrl;
    }

    // C. Fallback to Public URL if Internal not available
    if (!rawApiUrl && process.env['PUBLIC_API_URL']) {
      rawApiUrl = process.env['PUBLIC_API_URL'];
    }
  }

  // 3. Fallback to Vite/Astro Build Time Env
  if (!rawApiUrl) {
    rawApiUrl = import.meta.env.PUBLIC_API_URL;
  }

  // Fallback for local development if not set
  if (!rawApiUrl) {
    rawApiUrl = DEFAULT_DEV_URLS.API;
  }

  // Ensure protocol to prevent relative path resolution
  if (!rawApiUrl.startsWith('http')) {
    return `https://${rawApiUrl}`;
  }
  return rawApiUrl;
}

export function getWebappUrl(): string {
  let rawUrl: string | undefined;

  if (typeof window !== 'undefined' && window.__ENV__?.PUBLIC_WEBAPP_URL) {
    rawUrl = window.__ENV__.PUBLIC_WEBAPP_URL;
  } else if (
    typeof process !== 'undefined' &&
    process.env['PUBLIC_WEBAPP_URL']
  ) {
    rawUrl = process.env['PUBLIC_WEBAPP_URL'];
  } else {
    rawUrl = import.meta.env.PUBLIC_WEBAPP_URL;
  }

  if (!rawUrl) {
    rawUrl = DEFAULT_DEV_URLS.WEBAPP;
  }
  if (!rawUrl.startsWith('http')) {
    return `https://${rawUrl}`;
  }
  return rawUrl;
}

export function getWebsiteUrl(): string {
  let rawUrl: string | undefined;

  // 1. Explicit config from window.__ENV__ (injected by SSR)
  if (typeof window !== 'undefined' && window.__ENV__?.PUBLIC_WEBSITE_URL) {
    rawUrl = window.__ENV__.PUBLIC_WEBSITE_URL;
  }
  // 2. Process env (SSR/Node context)
  else if (
    typeof process !== 'undefined' &&
    process.env['PUBLIC_WEBSITE_URL']
  ) {
    rawUrl = process.env['PUBLIC_WEBSITE_URL'];
  }
  // 3. Build-time env
  else {
    rawUrl = import.meta.env.PUBLIC_WEBSITE_URL;
  }

  // 4. Smart fallback: use current origin ONLY if we're on the website (not webapp)
  // Webapp hostnames contain "-app" (e.g., staging-app.metacult.app, app.metacult.app)
  if (!rawUrl && typeof window !== 'undefined') {
    const isWebsite =
      !window.location.hostname.includes('-app') &&
      !window.location.hostname.startsWith('app.');
    if (isWebsite) {
      rawUrl = window.location.origin;
    }
  }

  // 5. Final fallback for local dev/SSR without config
  if (!rawUrl) {
    rawUrl = DEFAULT_DEV_URLS.WEBSITE;
  }

  if (!rawUrl.startsWith('http')) {
    return `https://${rawUrl}`;
  }
  return rawUrl;
}
