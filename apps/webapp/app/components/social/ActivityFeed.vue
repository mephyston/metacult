<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { MediaItem } from '@metacult/shared-types';
import { useWebsiteUrl } from '../../composables/useApiUrl';

interface FeedItem {
  id: string; // interaction ID
  userId: string;
  mediaId: string;
  action: string;
  sentiment?: string;
  createdAt: string;
  user?: { id: string; name: string; image?: string }; // Hydrated later
  media?: MediaItem & { remoteId?: string }; // Hydrated later
}

const feed = ref<FeedItem[]>([]);
const isLoading = ref(true);

const fetchFeed = async () => {
  isLoading.value = true;
  try {
    // 1. Fetch Interactions
    const { data: interactionData } = await useFetch<any>(
      '/api/interactions/feed',
    );
    if (!interactionData.value?.success) return;

    const rawFeed = interactionData.value.data as FeedItem[];

    if (rawFeed.length === 0) {
      feed.value = [];
      return;
    }

    // 2. Extract IDs for hydration
    const mediaIds = [...new Set(rawFeed.map((i) => i.mediaId))];
    const userIds = [...new Set(rawFeed.map((i) => i.userId))];

    // 3. Hydrate Media
    const mediaMap = new Map<string, MediaItem & { remoteId?: string }>();
    if (mediaIds.length > 0) {
      const { data: mediaData } = await useFetch<any>('/api/media/batch', {
        method: 'POST',
        body: { ids: mediaIds },
      });
      if (mediaData.value?.success) {
        mediaData.value.data.forEach((m: any) => mediaMap.set(m.id, m));
      }
    }

    // 4. Hydrate Users
    const userMap = new Map<string, any>();
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          // Use $fetch for non-reactive, one-off requests in loops
          const response = await $fetch<any>(`/api/users/${uid}`);
          if (response?.success) {
            userMap.set(uid, response.data);
          }
        } catch (e) {
          console.error('Failed to fetch user', uid);
          // Fallback for missing user
          userMap.set(uid, { name: 'Unknown User', id: uid });
        }
      }),
    );

    // 5. Assemble
    feed.value = rawFeed
      .map((item) => ({
        ...item,
        media: mediaMap.get(item.mediaId),
        user: userMap.get(item.userId),
      }))
      .filter((item) => item.media); // Only filter if media is missing, user can be partial
  } finally {
    isLoading.value = false;
  }
};
const websiteUrl = useWebsiteUrl();

onMounted(() => {
  fetchFeed();
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const getActionIcon = (action: string) => {
  if (action === 'WISHLIST') return '🔖';
  if (action === 'LIKE') return '❤️';
  if (action === 'DISLIKE') return '👎';
  return '•';
};

const getActionText = (action: string) => {
  if (action === 'WISHLIST') return 'wants to watch';
  if (action === 'LIKE') return 'liked';
  if (action === 'DISLIKE') return 'disliked';
  return 'interacted with';
};
</script>

<template>
  <div class="space-y-4">
    <template v-if="isLoading">
      <div class="flex justify-center p-8">
        <div class="animate-spin text-2xl">⏳</div>
      </div>
    </template>

    <template v-else-if="feed.length === 0">
      <div class="text-center p-12 text-muted-foreground">
        <p>No activity yet.</p>
        <p class="text-sm">Follow people to see their updates here!</p>
      </div>
    </template>

    <template v-else>
      <div
        v-for="item in feed"
        :key="item.id"
        class="flex gap-4 p-4 rounded-xl bg-card border border-border/50"
      >
        <!-- User Avatar -->
        <NuxtLink :to="`/user/${item.userId}`" class="shrink-0">
          <div class="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
            <img
              v-if="item.user?.image"
              :src="item.user.image"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              👤
            </div>
          </div>
        </NuxtLink>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline justify-between mb-1">
            <div class="text-sm">
              <NuxtLink
                :to="`/user/${item.userId}`"
                class="font-bold hover:underline"
              >
                {{ item.user?.name || 'Unknown' }}
              </NuxtLink>
              <span class="text-muted-foreground ml-1">{{
                getActionText(item.action)
              }}</span>
            </div>
            <span class="text-xs text-muted-foreground">{{
              formatDate(item.createdAt)
            }}</span>
          </div>

          <!-- Media Card -->
          <a
            v-if="item.media"
            :href="`${websiteUrl}/catalog/${item.media.type}/${item.media.remoteId || item.media.id}`"
            class="flex gap-3 bg-muted/30 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-pointer no-underline text-foreground"
          >
            <div class="w-12 h-16 bg-zinc-800 rounded shrink-0 overflow-hidden">
              <img
                v-if="item.media.posterUrl"
                :src="item.media.posterUrl"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-center">
              <h4 class="font-bold text-sm truncate">{{ item.media.title }}</h4>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="text-xs text-muted-foreground border border-border px-1 rounded"
                  >{{ item.media.type }}</span
                >
                <span class="text-sm">{{ getActionIcon(item.action) }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </template>
  </div>
</template>
