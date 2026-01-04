/**
 * Configuration des URLs par défaut pour le développement local
 * Utilisées comme fallback si les variables d'environnement ne sont pas définies
 *
 * ⚠️ Ces valeurs ne sont jamais utilisées en production
 * En production, les variables d'environnement DOIVENT être définies
 */

export const DEFAULT_DEV_URLS = {
  API: 'http://localhost:3000',
  WEBAPP: 'http://localhost:4201',
  WEBSITE: 'http://localhost:4444',
  REDIS: 'redis://localhost:6379',
} as const;

/**
 * Helper pour obtenir l'URL par défaut selon le contexte
 */
export function getDefaultUrl(type: keyof typeof DEFAULT_DEV_URLS): string {
  return DEFAULT_DEV_URLS[type];
}
