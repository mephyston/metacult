<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { SwipeDeck, Button } from '@metacult/shared-ui';
import { useAuthSession } from '../composables/useAuthSession';

// Get API URL from environment
const apiUrl = import.meta.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000';

const { user } = useAuthSession();
const isLoading = ref(true);
const queue = ref<any[]>([]);

// --- API Calls ---
const fetchFeed = async () => {
  isLoading.value = true;
  try {
    console.log('[Discover] Fetching from:', `${apiUrl}/api/discovery/feed`);
    const response = await fetch(`${apiUrl}/api/discovery/feed`, {
      credentials: 'include',
    });
    console.log('[Discover] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Discover] Received data:', data);

    // Adapter les données pour SwipeDeck si nécessaire
    queue.value = data.map((item: any) => {
      // Le feed mixed retourne { type: 'MEDIA', data: ... } ou { type: 'SPONSORED', data: ... }
      // SwipeDeck attend un objet plat avec id, title, image
      const media = item.data || item; // Support both wrapped and flat structure
      return {
        id: media.id,
        title: media.title,
        image: media.coverUrl || media.poster || '/placeholder-cover.jpg', // Fallback
        type: item.type || 'MEDIA',
        ...media,
      };
    });
    console.log('[Discover] Queue populated with', queue.value.length, 'items');
  } catch (error) {
    console.error('[Discover] Failed to fetch feed:', error);
    queue.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleInteraction = async (payload: any) => {
  // Optimistic UI: SwipeDeck gère déjà la suppression visuelle de la carte
  // On envoie juste la requête
  try {
    console.log('[Discover] Sending interaction:', payload);
    const response = await fetch(`${apiUrl}/api/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        mediaId: payload.mediaId,
        action: payload.action,
        sentiment: payload.sentiment,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[Discover] Interaction failed:',
        response.status,
        errorText,
      );
    } else {
      const result = await response.json();
      console.log('[Discover] Interaction saved:', result);
    }
  } catch (error) {
    console.error('[Discover] Failed to record interaction:', error);
    // TODO: Rollback UI if needed (complex with swipe)
  }
};

const handleEmpty = () => {
  console.log('[Discover] Deck empty, refreshing...');
  fetchFeed();
};

// --- Watchers ---
// Auto-refetch when queue is running low to ensure continuous discovery
watch(
  () => queue.value.length,
  (remaining) => {
    // When 3 or fewer items remain, preload next batch (but not if already loading or empty)
    if (remaining <= 3 && remaining > 0 && !isLoading.value) {
      console.log(
        '[Discover] Running low on content, prefetching next batch...',
      );
      fetchFeed();
    }
  },
);

// --- Lifecycle ---
onMounted(() => {
  fetchFeed();
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4"
  >
    <div
      v-if="isLoading && queue.length === 0"
      class="flex flex-col items-center gap-4 animate-pulse"
    >
      <div class="w-80 h-[500px] bg-muted rounded-xl" />
      <div class="h-4 w-32 bg-muted rounded" />
    </div>

    <div v-else-if="queue.length > 0" class="w-full">
      <SwipeDeck
        :items="queue"
        @interaction="handleInteraction"
        @empty="handleEmpty"
      />
    </div>

    <div v-else class="text-center space-y-4">
      <h2 class="text-2xl font-bold">Tout est calme...</h2>
      <p class="text-muted-foreground">
        Tu as vu tout ce qu'on avait pour l'instant ! Reviens plus tard.
      </p>
      <p class="text-xs text-muted-foreground">API URL: {{ apiUrl }}</p>
      <p class="text-xs text-muted-foreground">
        User: {{ user?.email || 'Not logged in' }}
      </p>
      <Button @click="fetchFeed"> Réessayer </Button>
    </div>
  </div>
</template>
