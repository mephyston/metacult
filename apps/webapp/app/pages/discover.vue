<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  Input,
  Button,
  Card,
  CardContent,
  Badge,
  SwipeDeck,
} from '@metacult/shared-ui';
import { useAuthSession } from '../composables/useAuthSession';
import { useApiUrl } from '../composables/useApiUrl';
import { useLogger } from '../composables/useLogger';

// Get API URL from environment
const apiUrl = useApiUrl();
const logger = useLogger();

const { user } = useAuthSession();
const isLoading = ref(false);
const queue = ref<any[]>([]);
const swipedIds = ref<Set<string>>(new Set());

// --- API Calls ---
const fetchFeed = async (append = false) => {
  if (isLoading.value) {
    logger.debug('[Discover] Already loading, skipping duplicate request');
    return;
  }

  isLoading.value = true;
  try {
    // Build URL with excluded IDs
    const excludedIds = Array.from(swipedIds.value);
    const url = new URL(`${apiUrl}/api/discovery/feed`);
    if (excludedIds.length > 0) {
      url.searchParams.set('excludedIds', excludedIds.join(','));
    }

    logger.debug('[Discover] Fetching from:', url.toString());
    logger.debug(
      '[Discover] User authenticated:',
      !!user.value,
      user.value?.email || 'Guest',
    );
    logger.debug('[Discover] Local swipedIds count:', swipedIds.value.size);
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    logger.debug('[Discover] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    logger.debug('[Discover] Received data:', data);

    // Adapter les données pour SwipeDeck
    const newItems = data
      .map((item: any) => {
        // Le feed mixed retourne { type: 'MEDIA', data: ... } ou { type: 'SPONSORED', data: ... }
        const media = item.data || item;
        return {
          id: media.id,
          title: media.title,
          image: media.coverUrl || media.poster || '/placeholder-cover.jpg',
          type: item.type || 'MEDIA',
          ...media,
        };
      })
      // Filter out items already in queue or already swiped
      .filter((item: any) => {
        const alreadyInQueue = queue.value.some((q) => q.id === item.id);
        const alreadySwiped = swipedIds.value.has(item.id);
        return !alreadyInQueue && !alreadySwiped;
      });

    if (append) {
      // Append new items to existing queue (for auto-reload)
      queue.value = [...queue.value, ...newItems];
      logger.debug(
        `[Discover] Appended ${newItems.length} new items, total queue: ${queue.value.length}`,
      );
    } else {
      // Replace queue (initial load or manual refresh)
      queue.value = newItems;
      logger.debug(
        '[Discover] Queue populated with',
        queue.value.length,
        'items',
      );
    }
  } catch (error) {
    logger.error('[Discover] Failed to fetch feed:', error);
    queue.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleInteraction = async (payload: any) => {
  // Track swiped media to exclude from future fetches
  swipedIds.value.add(payload.mediaId);

  // Optimistic UI: SwipeDeck gère déjà la suppression visuelle de la carte
  // On envoie juste la requête
  try {
    logger.debug('[Discover] Sending interaction:', payload);
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
      logger.error(
        '[Discover] Interaction failed:',
        response.status,
        errorText,
      );
    } else {
      const result = await response.json();
      logger.debug('[Discover] Interaction saved:', result);
    }
  } catch (error) {
    logger.error('[Discover] Failed to record interaction:', error);
    // TODO: Rollback UI if needed (complex with swipe)
  }
};

const handleEmpty = () => {
  logger.info('[Discover] Deck empty, refreshing...');
  queue.value = []; // Clear queue first
  swipedIds.value.clear(); // Reset on manual refresh
  fetchFeed(false);
};

// --- Watchers ---
// Auto-refetch when queue is running low to ensure continuous discovery
watch(
  () => queue.value.length,
  (remaining) => {
    // When 3 or fewer items remain, preload next batch (but not if already loading or empty)
    if (remaining <= 3 && remaining > 0 && !isLoading.value) {
      logger.debug(
        '[Discover] Running low on content (remaining:',
        remaining,
        '), prefetching next batch...',
      );
      fetchFeed(true); // Append mode
    }
  },
  { immediate: false },
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
      <h2 class="text-2xl font-bold">{{ $t('discover.emptyTitle') }}</h2>
      <p class="text-muted-foreground">
        {{ $t('discover.emptyDescription') }}
      </p>
      <p class="text-xs text-muted-foreground">API URL: {{ apiUrl }}</p>
      <p class="text-xs text-muted-foreground">
        User: {{ user?.email || 'Not logged in' }}
      </p>
      <Button @click="fetchFeed"> Réessayer </Button>
    </div>
  </div>
</template>
