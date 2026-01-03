import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
      PUBLIC_API_URL?: string;
    };
  }
}

export function getApiUrl(): string {
  // Priority:
  // 1. Window Runtime Config (Browser Hydration)
  // 2. Process Env (Node/SSR Runtime)
  // 3. Import Meta (Build Time)

  let rawApiUrl: string | undefined;

  if (typeof window !== 'undefined' && window.__ENV__?.PUBLIC_API_URL) {
    rawApiUrl = window.__ENV__.PUBLIC_API_URL;
  } else if (typeof process !== 'undefined' && process.env['PUBLIC_API_URL']) {
    rawApiUrl = process.env['PUBLIC_API_URL'];
  } else {
    rawApiUrl = import.meta.env.PUBLIC_API_URL;
  }

  // Fallback for local development if not set
  if (!rawApiUrl) {
    rawApiUrl = 'http://127.0.0.1:3000';
  }

  // Ensure protocol to prevent relative path resolution (fixing 404 on staging)
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
    rawUrl = 'http://localhost:4201';
  }
  if (!rawUrl.startsWith('http')) {
    return `https://${rawUrl}`;
  }
  return rawUrl;
}
