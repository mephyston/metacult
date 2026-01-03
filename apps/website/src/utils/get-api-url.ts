import { DEFAULT_DEV_URLS } from '@metacult/shared-core';

/**
 * Résolution intelligente de l'URL de l'API pour Astro
 * Gère le "Split Horizon" entre Server-Side et Client-Side
 * 
 * Logique :
 * - Server-Side (SSR/SSG) : Préfère INTERNAL_API_URL pour rester dans le réseau privé Railway
 * - Client-Side (Hydration) : Utilise PUBLIC_API_URL exposée via import.meta.env
 * 
 * @returns {string} URL de l'API (avec protocole)
 */
export function getApiUrl(): string {
  // Server-Side (Node/Bun runtime)
  if (typeof process !== 'undefined' && import.meta.env.SSR) {
    // 1. Priorité à l'URL interne pour le S2S (Service-to-Service)
    const internalApiUrl = import.meta.env.INTERNAL_API_URL;
    if (internalApiUrl) {
      // Ensure protocol
      if (!internalApiUrl.startsWith('http')) {
        return `http://${internalApiUrl}`;
      }
      return internalApiUrl;
    }
  }

  // Client-Side (Browser) ou Fallback SSR
  // Astro expose les variables PUBLIC_* via import.meta.env
  const publicApiUrl = import.meta.env.PUBLIC_API_URL;
  
  if (publicApiUrl) {
    // Ensure protocol
    if (!publicApiUrl.startsWith('http')) {
      return `https://${publicApiUrl}`;
    }
    return publicApiUrl;
  }

  // Fallback pour développement local
  return DEFAULT_DEV_URLS.API;
}

/**
 * Résolution de l'URL du site Website (pour liens retour depuis Webapp)
 */
export function getWebsiteUrl(): string {
  const publicWebsiteUrl = import.meta.env.PUBLIC_WEBSITE_URL;
  
  if (publicWebsiteUrl) {
    if (!publicWebsiteUrl.startsWith('http')) {
      return `https://${publicWebsiteUrl}`;
    }
    return publicWebsiteUrl;
  }

  // Fallback pour développement local
  return DEFAULT_DEV_URLS.WEBSITE;
}
