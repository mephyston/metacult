import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Support for Node.js process environment in shared code
declare const process: { env: Record<string, string | undefined> };

export function getApiUrl(): string {
  // Use PUBLIC_API_URL if available, otherwise relative path (assuming proxy) or default localhost

  // Check process.env for Node/SSR runtime
  let rawApiUrl: string | undefined;
  if (typeof process !== 'undefined' && process.env['PUBLIC_API_URL']) {
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

  // Check process.env for Node/SSR runtime (Railway injects variables at runtime)
  if (typeof process !== 'undefined' && process.env['PUBLIC_WEBAPP_URL']) {
    rawUrl = process.env['PUBLIC_WEBAPP_URL'];
  }
  // Fallback to build-time injected variable
  else {
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
