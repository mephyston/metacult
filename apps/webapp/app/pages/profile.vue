<script setup lang="ts">
import { ref, computed } from 'vue';
import { liveQuery } from 'dexie';
import { useObservable } from '@vueuse/rxjs';
import { db } from '@metacult/shared-local-db';
import { from } from 'rxjs';
import MediaGrid from '../components/ui/MediaGrid.vue';
import type { MediaItem } from '@metacult/shared-types';
import { useAuthSession } from '../composables/useAuthSession';

// --- Auth ---
const { user, clearSession } = useAuthSession();

// --- Tabs ---
const activeTab = ref<'wishlist' | 'history'>('wishlist');

// --- Data Fetching ---
// Helper to join interactions with media
const getMediaFromInteractions = async (action: string) => {
  const interactions = await db.interactions
    .where('action')
    .equals(action)
    .reverse()
    .sortBy('timestamp');

  if (interactions.length === 0) return [];

  const mediaIds = interactions.map((i) => i.mediaId);
  const mediaItems = await db.media.bulkGet(mediaIds);

  // Filter out undefineds (in case media was deleted but interaction remained)
  return mediaItems.filter((item) => !!item) as MediaItem[];
};

// Wishlist Observable
const wishlist = useObservable<MediaItem[], MediaItem[]>(
  from(liveQuery(async () => getMediaFromInteractions('WISHLIST'))),
  { initialValue: [] },
);

// History Observable (LIKED + BANGER)
// Note: Dexie limitation, can't easily do OR query on index simply.
// We'll fetch LIKE and filter or fetch both.
const history = useObservable<MediaItem[], MediaItem[]>(
  from(
    liveQuery(async () => {
      // Fetch LIKE and BANGER (if we tracked it as separate action? No, action is LIKE, sentiment is BANGER)
      // So just fetching LIKE covers both GOOD and BANGER if action is LIKE
      const likes = await getMediaFromInteractions('LIKE');
      // Maybe also DISLIKE?
      return likes;
    }),
  ),
  { initialValue: [] },
);

const currentItems = computed(() => {
  return activeTab.value === 'wishlist' ? wishlist.value : history.value;
});

const removeFromList = async (item: MediaItem) => {
  const actionTarget = activeTab.value === 'wishlist' ? 'WISHLIST' : 'LIKE';
  await db.interactions.delete(item.id);
};

const handleSignOut = async () => {
  await clearSession();
  window.location.href = '/';
};
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <!-- Header -->
    <header
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <div class="px-6 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-display font-black tracking-tight">Profile</h1>

        <button
          v-if="user"
          @click="handleSignOut"
          class="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign Out
        </button>
      </div>

      <!-- User Info (Minimal) -->
      <div class="px-6 pb-6 pt-2 flex items-center gap-4">
        <div
          class="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl relative overflow-hidden ring-2 ring-primary/20"
        >
          <img
            v-if="user?.avatarUrl"
            :src="user.avatarUrl"
            class="w-full h-full object-cover"
          />
          <span v-else>👤</span>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <p class="font-bold text-lg leading-tight">
              {{ user?.username || 'Guest User' }}
            </p>
            <span
              v-if="user?.level"
              class="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded border border-primary/20"
            >
              LVL {{ user.level }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground">
            {{ user?.email || 'Local Session' }}
          </p>

          <!-- XP Bar -->
          <div v-if="user?.nextLevelXp" class="mt-2 text-xs">
            <div class="flex justify-between mb-1 text-muted-foreground">
              <span>XP</span>
              <span>{{ user.xp }} / {{ user.nextLevelXp }}</span>
            </div>
            <div class="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-500"
                :style="{
                  width: `${Math.min((user.xp! / user.nextLevelXp!) * 100, 100)}%`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div
        class="flex px-6 gap-6 text-sm font-medium border-b border-border/50"
      >
        <button
          @click="activeTab = 'wishlist'"
          class="pb-3 relative transition-colors"
          :class="
            activeTab === 'wishlist'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          Wishlist
          <span class="ml-1 opacity-60 text-xs">{{
            wishlist?.length || 0
          }}</span>
          <div
            v-if="activeTab === 'wishlist'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          />
        </button>
        <button
          @click="activeTab = 'history'"
          class="pb-3 relative transition-colors"
          :class="
            activeTab === 'history'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          History
          <span class="ml-1 opacity-60 text-xs">{{
            history?.length || 0
          }}</span>
          <div
            v-if="activeTab === 'history'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          />
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="pt-4">
      <MediaGrid :items="currentItems || []">
        <template #actions="{ item }">
          <button
            @click.stop="removeFromList(item)"
            class="bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors shadow-lg"
            title="Remove from list"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-trash-2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        </template>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-12 gap-4">
            <div
              class="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-2xl opacity-50"
            >
              {{ activeTab === 'wishlist' ? '🔖' : '🕰️' }}
            </div>
            <p class="text-muted-foreground max-w-xs text-center">
              {{
                activeTab === 'wishlist'
                  ? "You haven't added anything to your wishlist yet. Swipe Up to save for later!"
                  : 'No history yet. Start swiping to build your taste profile.'
              }}
            </p>
            <NuxtLink
              to="/discover"
              class="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
            >
              Go Swipe
            </NuxtLink>
          </div>
        </template>
      </MediaGrid>
    </main>
  </div>
</template>
