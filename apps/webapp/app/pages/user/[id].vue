<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MediaGrid from '../../components/ui/MediaGrid.vue';
import type { MediaItem } from '@metacult/shared-types';
import { useAuthSession } from '../../composables/useAuthSession';

const route = useRoute();
const userId = route.params.id as string;
const { user: currentUser } = useAuthSession();

const activeTab = ref<'wishlist' | 'history'>('wishlist');
const isLoading = ref(true);
const isFollowing = ref(false);
const followLoading = ref(false);

// Data refs
const profileUser = ref<any>(null);
const wishlistItems = ref<MediaItem[]>([]);
const historyItems = ref<MediaItem[]>([]);

// Fetch User Profile
const { data: userData, error: userError } = await useFetch<{
  success: boolean;
  data: any;
}>(`/api/users/${userId}`);
if (userData.value?.success) {
  profileUser.value = userData.value.data;
} else {
  // Handle 404
}

// Check Follow Status
const checkFollowStatus = async () => {
  if (!currentUser.value) return;
  const { data } = await useFetch<{ success: boolean; data: string[] }>(
    '/api/social/following',
  );
  if (data.value?.success) {
    isFollowing.value = data.value.data.includes(userId);
  }
};

// Fetch Interactions & Media
const fetchContent = async () => {
  isLoading.value = true;
  try {
    // 1. Fetch Interactions
    const { data: interactionsData } = await useFetch<{
      success: boolean;
      data: any[];
    }>(`/api/interactions/user/${userId}`);
    if (!interactionsData.value?.success) return;

    const interactions = interactionsData.value.data;

    // 2. Extract Media IDs
    const mediaIds = [...new Set(interactions.map((i: any) => i.mediaId))];

    // 3. Fetch Media Details (Batch)
    if (mediaIds.length > 0) {
      const { data: mediaData } = await useFetch<{
        success: boolean;
        data: any[];
      }>('/api/media/batch', {
        method: 'POST',
        body: { ids: mediaIds },
      });

      if (mediaData.value?.success) {
        const mediaMap = new Map(
          mediaData.value.data.map((m: any) => [m.id, m]),
        );

        // 4. Distribute to Lists
        const wishlist: MediaItem[] = [];
        const history: MediaItem[] = [];

        interactions.forEach((i: any) => {
          const media = mediaMap.get(i.mediaId);
          if (media) {
            // Cast to MediaItem locally to satisfy TS if the API shape matches
            const mediaItem = media as MediaItem;
            if (i.action === 'WISHLIST') {
              wishlist.push(mediaItem);
            } else if (i.action === 'LIKE' || i.action === 'DISLIKE') {
              // Maybe only LIKE?
              if (i.action === 'LIKE') history.push(mediaItem);
            }
          }
        });

        wishlistItems.value = wishlist;
        historyItems.value = history.reverse(); // Newest first
      }
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkFollowStatus();
  fetchContent();
});

// Actions
const toggleFollow = async () => {
  if (!currentUser.value) return;
  followLoading.value = true;
  try {
    if (isFollowing.value) {
      await $fetch('/api/social/follow', {
        method: 'DELETE',
        body: { targetUserId: userId },
      });
      isFollowing.value = false;
    } else {
      await $fetch('/api/social/follow', {
        method: 'POST',
        body: { targetUserId: userId },
      });
      isFollowing.value = true;
    }
  } catch (e) {
    console.error('Follow toggle failed', e);
  } finally {
    followLoading.value = false;
  }
};

const currentItems = computed(() => {
  return activeTab.value === 'wishlist'
    ? wishlistItems.value
    : historyItems.value;
});
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <header
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <div class="px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-muted-foreground hover:text-foreground">
          ← Back
        </NuxtLink>
        <h1 class="text-xl font-bold truncate px-4">
          {{ profileUser?.name || 'User Profile' }}
        </h1>
        <div class="w-8"></div>
        <!-- Spacer -->
      </div>

      <!-- Profile Info -->
      <div
        class="px-6 pb-6 pt-2 flex flex-col items-center justify-center gap-4"
      >
        <div
          class="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-3xl overflow-hidden"
        >
          <img
            v-if="profileUser?.image"
            :src="profileUser.image"
            alt="Avatar"
            class="w-full h-full object-cover"
          />
          <span v-else>👤</span>
        </div>
        <div class="text-center">
          <!-- <p class="font-bold text-xl">{{ profileUser?.name }}</p> -->
          <!-- <p class="text-sm text-muted-foreground">@{{ userId.substring(0,8) }}</p> -->
        </div>

        <button
          v-if="currentUser && currentUser.id !== userId"
          @click="toggleFollow"
          :disabled="followLoading"
          class="px-6 py-2 rounded-full font-bold text-sm transition-all transform hover:scale-105 active:scale-95"
          :class="
            isFollowing
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          "
        >
          {{ isFollowing ? 'Unfollow' : 'Follow' }}
        </button>
      </div>

      <!-- Tabs -->
      <div
        class="flex px-6 gap-6 text-sm font-medium border-b border-border/50 justify-center"
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
            wishlistItems.length
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
          <span class="ml-1 opacity-60 text-xs">{{ historyItems.length }}</span>
          <div
            v-if="activeTab === 'history'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          />
        </button>
      </div>
    </header>

    <main class="pt-4">
      <template v-if="isLoading">
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin text-2xl">⏳</div>
        </div>
      </template>
      <template v-else>
        <MediaGrid :items="currentItems">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-12 gap-4">
              <div class="text-4xl opacity-50">📭</div>
              <p class="text-muted-foreground">
                User has no items in this list yet.
              </p>
            </div>
          </template>
        </MediaGrid>
      </template>
    </main>
  </div>
</template>
