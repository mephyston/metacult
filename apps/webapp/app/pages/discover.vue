<script setup lang="ts">
import OfflineDeck from '../components/smart/OfflineDeck.vue';
import { useAuthSession } from '../composables/useAuthSession';

const { user } = useAuthSession();
// OfflineDeck handles loading state internally via liveQuery,
// but we might want to know if it's empty to show the "Everything swiped" state.
// Currently OfflineDeck renders 'All caught up' internally or we can listen to @empty.
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4"
  >
    <div class="w-full">
      <!-- 
        OfflineDeck acts as the Smart Component (Container).
        It manages:
        1. Querying Dexie for the Daily Stack
        2. Mapping MediaItems to SwipeItems
        3. Persisting Swipes to Outbox
        4. Removing Swiped items from Stack
       -->
      <OfflineDeck />
    </div>

    <!-- Fallback / Debug Info if needed, or if OfflineDeck emits 'empty' event we could show something here -->
    <div class="mt-8 text-center text-xs text-muted-foreground">
      <p>User: {{ user?.email || 'Guest' }}</p>
      <p>Mode: Offline-First</p>
    </div>
  </div>
</template>
