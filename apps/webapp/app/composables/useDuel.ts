import { ref } from 'vue';
import { useLogger } from './useLogger';

/**
 * Interface simplifiée pour le frontend.
 * Contient les champs nécessaires pour l'affichage de la carte de duel.
 */
export interface DuelMedia {
  id: string;
  title: string;
  coverUrl: string | null;
  type: 'game' | 'movie' | 'tv' | 'book';
  releaseYear?: { value: number };
  rating?: { value: number };
  // Champs spécifiques potentiels déjà mappés par le backend
  director?: string | null;
  creator?: string | null;
  developer?: string | null;
  author?: string | null;
}

interface DuelResponse {
  data?: DuelMedia[];
  meta?: {
    status: string;
    message: string;
  };
}

/**
 * Composable pour gérer la logique de duel (vote entre deux médias).
 */
export const useDuel = () => {
  const currentPair = ref<DuelMedia[] | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isEmpty = ref(false);

  /**
   * Récupère une nouvelle paire de médias à comparer.
   * Gère le cas où l'utilisateur n'a pas assez de likes.
   */
  const fetchPair = async () => {
    const logger = useLogger();
    loading.value = true;
    error.value = null;
    isEmpty.value = false;

    try {
      // On utilise $fetch qui gère automatiquement le baseURL via proxy ou config Nuxt
      const response = await $fetch<DuelMedia[] | DuelResponse>('/api/duel', {
        headers: {
          // Explicitly ask for JSON just in case
          Accept: 'application/json',
        },
      });

      // Vérification du cas "Insufficient Likes" (Structure { data: [], meta: ... })
      // On check si la réponse a une propriété 'meta'
      if (
        'meta' in response &&
        response.meta?.status === 'insufficient_likes'
      ) {
        isEmpty.value = true;
        currentPair.value = null;
      } else if (Array.isArray(response) && response.length === 2) {
        // Cas succès standard : Array direct
        currentPair.value = response as DuelMedia[];
      } else {
        // Fallback bizarrerie
        logger.warn('[useDuel] Invalid response format:', response);
        error.value = 'Invalid response format';
        currentPair.value = null;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[useDuel] Error fetching pair:', err);
      error.value = message || 'Failed to fetch duel pair';
      currentPair.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Vote pour un gagnant.
   * - winnerId: ID du média choisi
   * - Optimistic update : on relance le fetch immédiatement sans attendre le résultat du POST.
   */
  const vote = async (winnerId: string) => {
    const logger = useLogger();
    if (!currentPair.value || currentPair.value.length !== 2) return;

    const pair = currentPair.value;
    const loser = pair.find((m: DuelMedia) => m.id !== winnerId);

    if (!loser) {
      logger.error(
        '[useDuel] Loser not found in current pair for winner:',
        winnerId,
      );
      return;
    }

    const loserId = loser.id;

    // Fire and forget pour l'UI, mais on catche les erreurs en background si besoin
    $fetch('/api/duel/vote', {
      method: 'POST',
      body: {
        winnerId,
        loserId,
      },
    }).catch((err) => {
      logger.error('[useDuel] Vote failed in background:', err);
      // On pourrait toaster une erreur ici si critique
    });

    // On enchaîne directement vers la prochaine paire pour la fluidité
    await fetchPair();
  };

  return {
    currentPair,
    loading,
    error,
    isEmpty,
    fetchPair,
    vote,
  };
};
