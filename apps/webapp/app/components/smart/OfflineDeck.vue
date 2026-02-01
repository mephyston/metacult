<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { liveQuery } from 'dexie';
import { useObservable } from '@vueuse/rxjs';

import { db } from '@metacult/shared-local-db';

import { addToOutbox } from '@metacult/shared-sync-manager';
import { SwipeDeck } from '@metacult/shared-ui'; // Clean barrel import

// --- Local State via Dexie LiveQuery ---
// We assume 'dailyStack' table holds the cards for today.
// In a real flow, a Sync Worker would populate this table.
import type { MediaItem } from '@metacult/shared-types';
import { from } from 'rxjs'; // Fix Dexie interop

// 1. Wrap liveQuery in RxJS 'from' to make it compatible with useObservable
const mediaItems = useObservable<MediaItem[], MediaItem[]>(
  from(
    liveQuery<MediaItem[]>(async () => {
      return db.dailyStack.toArray();
    }),
  ),
  { initialValue: [] },
);

// 2. Map MediaItem (Back/DB) -> SwipeItem (UI)
// SwipeItem expects 'image', MediaItem has 'posterUrl'
const deckItems = computed(() => {
  return (mediaItems.value || []).map((item) => ({
    ...item,
    image: item.posterUrl || 'https://placehold.co/400x600?text=No+Image', // Fallback
  }));
});

// --- Handle Interactions ---
const onInteraction = async (payload: any) => {
  console.log('Interaction:', payload);

  // 1. Remove from local view (Instant Feedback) -> Handled by SwipeDeck internally via deck.shift()
  // But we should also remove from DB to persist the state
  await db.dailyStack.delete(payload.mediaId);

  // 2. Persist Action for Sync
  await addToOutbox({
    type: 'SWIPE',
    payload: payload,
    createdAt: Date.now(),
  });

  // 3. Persist Action for Local Query (Profile / History)
  await db.interactions.put({
    mediaId: payload.mediaId,
    action: payload.action,
    sentiment: payload.sentiment,
    timestamp: Date.now(),
  });
};

const onUndo = async (payload: any) => {
  console.log('Undo Interaction:', payload);

  // 1. Put back into dailyStack (Local DB)
  // We need to fetch the full MediaItem from db.media to restore it correctly
  const mediaItem = await db.media.get(payload.mediaId);
  if (mediaItem) {
    await db.dailyStack.put(mediaItem);
  } else {
    console.warn(
      '[OfflineDeck] Cannot restore item to stack (missing in library):',
      payload.mediaId,
    );
  }

  // 2. Remove from interactions (Local DB)
  // We delete by combinatory key or just matching mediaId + timestamp?
  // Schema for interactions: [userId+mediaId] or just auto-increment?
  // Let's assume we can find it by mediaId + recent timestamp or just mediaId if unique in recent context.
  // Actually, Dexie 'interactions' table primary key definition needed.
  // Assuming simpler delete for now:
  // await db.interactions.delete(payload.mediaId); // If PK is mediaId

  // Safe filtering deletion if PK is not mediaId:
  const lastInteraction = await db.interactions
    .where('mediaId')
    .equals(payload.mediaId)
    .reverse()
    .first();

  if (lastInteraction) {
    // @ts-ignore - Dexie types mismatch sometimes
    await db.interactions.delete(lastInteraction.id || lastInteraction.mediaId);
  }

  // 3. Remove from Outbox (Sync)
  // Find pending outbox item for this media and type 'SWIPE'
  const outboxItem = await db.outbox
    .where({ type: 'SWIPE' })
    .filter((item: any) => item.payload.mediaId === payload.mediaId)
    .last();

  if (outboxItem && outboxItem.status === 'pending') {
    await db.outbox.delete(outboxItem.id as number);
    console.log('[OfflineDeck] Undo: Removed pending swipe from outbox');
  } else {
    // Already synced? We might need to send a 'UNDO_SWIPE' action.
    // For MVP, we just accept local revert.
    console.log(
      '[OfflineDeck] Undo: Swipe already synced or not found. Local revert only.',
    );
  }
};

// --- Smart Caching Logic ---
const fetchAndCacheFeed = async () => {
  // Only fetch if online
  if (!navigator.onLine) return;

  // Optional: Check if we have enough items
  const count = await db.dailyStack.count();
  if (count > 5) return; // Don't over-fetch if we have a stack

  try {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiUrl || 'http://localhost:3000';

    // Exclude already swiped items (from local DB or session)
    // Ideally we fetch what's NOT in local DB.

    const response = await fetch(`${apiBase}/api/discovery/feed`, {
      credentials: 'include',
    });

    // noinspection ExceptionCaughtLocallyJS
    if (!response.ok) throw new Error('Failed to fetch feed');

    const data = await response.json();

    // Map API DTO -> MediaItem (DB Schema)
    // API returns mixed items: { type: 'MEDIA', data: { id, title, type, coverUrl, ... } }
    // OR { id, title, type, coverUrl ... } depending on endpoint version.
    // Let's assume standardized mixed feed format.

    const newItems: MediaItem[] = data.map((item: any) => {
      const media = item.data || item;
      return {
        id: media.id,
        remoteId: media.id, // remoteId is same as id for now
        type: item.type || media.type || 'movie',
        title: media.title,
        rating: media.globalRating || 0,
        posterUrl: media.coverUrl || media.poster || null, // Map coverUrl -> posterUrl
        releaseDate: media.releaseDate,
        offers: media.offers || [],
      };
    });

    // Filter duplicates against DB
    // Use bulkPut to update existing or add new
    await db.media.bulkPut(newItems); // Store in global library
    await db.dailyStack.bulkPut(newItems); // Store in daily stack
    console.log(
      `[OfflineDeck] Cached ${newItems.length} items to Library & Stack`,
    );

    // Prefetch images to warm up Service Worker Cache (CacheFirst policy)
    newItems.forEach((item) => {
      if (item.posterUrl) {
        const img = new Image();
        img.src = item.posterUrl;
      }
    });
  } catch (err) {
    // noinspection ExceptionCaughtLocallyJS
    console.error('[OfflineDeck] Failed to load offline feed', err);
  }
};

onMounted(() => {
  fetchAndCacheFeed();
});
</script>

<template>
  <div class="w-full h-full">
    <SwipeDeck
      v-if="deckItems && deckItems.length > 0"
      :items="deckItems"
      @interaction="onInteraction"
      @undo="onUndo"
    />
    <div
      v-else
      class="flex items-center justify-center h-full text-muted-foreground"
    >
      No cards left for today!
    </div>
  </div>
</template>
