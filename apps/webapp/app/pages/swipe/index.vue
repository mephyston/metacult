<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthSession } from '../../composables/useAuthSession';
import { useApiUrl } from '../../composables/useApiUrl';
import { SwipeDeck } from '@metacult/shared-ui';
import { Film, Tv, Gamepad2, BookOpen } from 'lucide-vue-next';
// import { useRequestHeaders } from '#app'; // Auto-imported

// --- State ---
const route = useRoute();
const router = useRouter();
const { user } = useAuthSession();
const apiUrl = useApiUrl();
// Allow items to be any for now as SwipeDeck uses loose typing or shared-types might mismatch
const items = ref<any[]>([]);
const isLoading = ref(true);
const onboardingCount = ref(0);

const isOnboarding = computed(() => route.query.mode === 'onboarding');

// --- Actions ---
const fetchItems = async () => {
  isLoading.value = true;
  try {
    const headers = import.meta.server
      ? useRequestHeaders(['cookie'])
      : undefined;
    const modeParam = isOnboarding.value ? '&mode=onboarding' : '';
    const userCats = user.value?.preferences?.categories || [];
    const typesParam =
      userCats.length > 0 && isOnboarding.value
        ? `&types=${userCats.join(',')}`
        : '';

    console.log('DEBUG fetchItems:', {
      isOnboarding: isOnboarding.value,
      userCats,
      typesParam,
      fullUrl: `${apiUrl}/api/discovery/feed?limit=20${typesParam}${modeParam}`,
    });

    // Fetch feed with limit 20 to ensure enough items
    const [data] = await Promise.all([
      $fetch<any[]>(
        `${apiUrl}/api/discovery/feed?limit=20${typesParam}${modeParam}`,
        {
          headers: headers as any,
          credentials: 'include',
        },
      ),
      items.value.length === 0
        ? new Promise((resolve) => setTimeout(resolve, 1500))
        : Promise.resolve(), // Only delay on initial load
    ]);

    if (Array.isArray(data)) {
      const newItems = data
        .filter((item) => item.type === 'MEDIA' || item.type === 'SPONSORED')
        .map((item) => {
          const content = item.data;
          return {
            ...content,
            id: content.id || `temp-${Math.random()}`,
            image:
              content.poster ||
              content.image ||
              content.coverUrl ||
              'https://placehold.co/400x600?text=No+Image',
            title: content.title || content.name || 'Untitled',
            // Store detailed type (movie, game) in meta, keep item.type for renderer if needed
            mediaType: content.type || 'unknown',
            type: item.type,
          };
        });

      // Avoid duplicates if appending
      const existingIds = new Set(items.value.map((i) => i.id));
      const uniqueNewItems = newItems.filter((i) => !existingIds.has(i.id));
      items.value.push(...uniqueNewItems); // Changed to push uniqueNewItems
      if (items.value.length === 0) {
        // If we got no items and have no items, redirect to dashboard as requested
        console.warn('No items found in feed. Redirecting to dashboard.');
        await router.push('/');
        return;
      }
    } else if (items.value.length === 0) {
      // If response is invalid/empty and we have no items
      console.warn('Empty feed response. Redirecting to dashboard.');
      await router.push('/');
      return;
    }
  } catch (e) {
    console.error('Failed to fetch items:', e);
  } finally {
    isLoading.value = false;
  }

  // Double check: if we are done loading and have no items, redirect
  if (items.value.length === 0) {
    console.warn('Final check: No items. Redirecting to dashboard.');
    await router.push('/');
    return;
  }
};

const dnaScores = ref({
  movie: 0,
  tv: 0,
  game: 0,
  book: 0,
});

const PROGRESS_GOAL_PER_TYPE = 5; // Goal: 5 likes per selected category
const MAX_SWIPES_SAFETY = 20; // Safety valve

const handleSwipe = async (payload: any) => {
  const { action, mediaId } = payload;

  // Find the item to get its type
  const item = items.value.find((i) => i.id === mediaId);

  // Check if item exists
  if (!item) {
    console.warn('Swipe item not found for ID:', mediaId);
    return;
  }

  if (item && action === 'LIKE') {
    const type = item.mediaType?.toLowerCase();
    console.log('User Liked Item:', {
      id: item.id,
      title: item.title,
      rawType: item.mediaType,
      normalizedType: type,
    });

    if (type && type in dnaScores.value) {
      dnaScores.value[type as keyof typeof dnaScores.value]++;
      console.log(
        'Updated Score for:',
        type,
        'New Score:',
        dnaScores.value[type as keyof typeof dnaScores.value],
      );
    } else {
      console.warn('Type not found in dnaScores:', type);
    }
  }

  // Check if we need to refill the deck (Continuous Feed)
  if (isOnboarding.value && items.value.length < 5 && !isLoading.value) {
    await fetchItems();
  }

  if (isOnboarding.value) {
    onboardingCount.value++;

    // Logic: Complete if goal met for ALL selected categories
    const userCats = user.value?.preferences?.categories || [];
    // If no categories selected (shouldn't happen), assume goal met.
    // If categories are selected, user MUST reach goal for each.

    const isGoalMet =
      userCats.length > 0 &&
      userCats.every((cat: string) => {
        const score = dnaScores.value[cat as keyof typeof dnaScores.value] || 0;
        return score >= PROGRESS_GOAL_PER_TYPE;
      });

    if (isGoalMet) {
      await completeOnboarding();
    }
  }
};

const completeOnboarding = async () => {
  if (!user.value) return;
  try {
    await $fetch(`${apiUrl}/api/users/${user.value.id}`, {
      method: 'PATCH',
      body: { onboardingCompleted: true },
      credentials: 'include',
    });
    // Redirect to Dashboard (clean URL)
    await router.push('/');
  } catch (e) {
    console.error('Failed to complete onboarding', e);
  }
};

// Initial fetch watcher
watch(
  user,
  (newUser) => {
    if (newUser && items.value.length === 0) {
      // Validation: If Onboarding, ENSURE categories are present
      const cats = newUser.preferences?.categories || [];
      if (isOnboarding.value && cats.length === 0) {
        console.warn(
          'Onboarding mode but no categories found in user profile. Waiting or invalid state.',
        );
        isLoading.value = false; // Stop loading spinner
        // Optionally could redirect or retry profile fetch here
        return;
      }

      // Initial fetch once user is available
      fetchItems();
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div
    class="h-[calc(100vh-64px)] w-full flex flex-col relative overflow-hidden bg-background"
  >
    <!-- Onboarding Progress Bar (Top) -->
    <div
      v-if="isOnboarding"
      class="absolute top-0 left-0 right-0 z-20 px-6 py-4 pointer-events-none"
    >
      <!-- Glassy pill for progress -->
      <div
        class="bg-background/80 backdrop-blur-md rounded-full px-4 py-2 flex items-center justify-between shadow-sm border border-border/50"
      >
        <span class="text-xs font-bold text-foreground/80"
          >Affinity Profile</span
        >
        <div class="flex items-center gap-2">
          <!-- Progress Bar now tracks "Overall Progress" implicitly via swipe count for now, or we can make it "Percent of Goals Met" -->
          <!-- Let's keep it simple: Progress towards Safety Valve or Goals? -->
          <!-- Visual feedback is mostly in the DNA widget. This top bar can show "Overall Calibration". -->
          <div class="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all duration-500 ease-out"
              :style="{
                width: `${Math.min((onboardingCount / MAX_SWIPES_SAFETY) * 100, 100)}%`,
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="flex-1 flex flex-col items-center justify-center p-4 animate-pulse"
    >
      <!-- Skeleton Card -->
      <div
        class="relative w-full max-w-sm aspect-[3/4] rounded-3xl bg-muted overflow-hidden border border-border shadow-xl"
      >
        <!-- Image Placeholder -->
        <div class="absolute inset-0 bg-muted-foreground/10"></div>
        <!-- Controls Placeholder -->
        <div
          class="absolute bottom-0 left-0 right-0 p-6 space-y-4 bg-gradient-to-t from-black/60 to-transparent"
        >
          <div class="h-8 w-3/4 bg-white/20 rounded-md"></div>
          <div class="h-4 w-1/2 bg-white/10 rounded-md"></div>
          <div class="flex gap-4 pt-2 justify-center">
            <div class="h-14 w-14 rounded-full bg-white/10"></div>
            <div class="h-14 w-14 rounded-full bg-white/10"></div>
          </div>
        </div>
      </div>
      <div class="mt-8 text-center space-y-2">
        <div class="h-4 w-48 mx-auto bg-muted rounded"></div>
        <div class="h-3 w-32 mx-auto bg-muted/50 rounded"></div>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col items-center relative">
      <!-- Main Deck Area -->
      <!-- Added gap-8 (mt-8) for spacing -->
      <div
        class="flex-1 w-full flex items-center justify-center px-4 pt-8 pb-4 max-h-[70vh]"
      >
        <SwipeDeck
          :items="items"
          @interaction="handleSwipe"
          :showFooter="!isOnboarding"
        >
          <template #empty="{ reset }">
            <div class="text-center space-y-4">
              <p class="text-2xl font-bold">Plus de recommandations !</p>
              <button
                @click="reset"
                class="px-6 py-2 bg-secondary rounded-full"
              >
                Revoir
              </button>
            </div>
          </template>
        </SwipeDeck>
      </div>

      <!-- Cultural DNA Widget (Bottom) -->
      <!-- Adjusted margins and spacing -->
      <div
        v-if="isOnboarding"
        class="w-full max-w-md px-6 pb-24 md:pb-12 animate-in slide-in-from-bottom-4 duration-500 fade-in mt-auto mb-4"
      >
        <div
          class="bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-5 shadow-lg"
        >
          <div class="flex justify-between items-center mb-4">
            <span
              class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >ADN Culturel</span
            >
            <span
              class="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-medium"
              >Niveau 1</span
            >
          </div>

          <div class="grid grid-cols-4 gap-4">
            <!-- Movie -->
            <div class="flex flex-col items-center gap-2 group">
              <div
                class="relative p-2.5 rounded-xl bg-background border border-border/50 shadow-sm transition-all duration-300"
                :class="{
                  'border-red-500/50 bg-red-500/10 scale-110':
                    dnaScores.movie > 0,
                  'opacity-50 grayscale':
                    !user?.preferences?.categories?.includes('movie'),
                }"
              >
                <Film
                  class="w-5 h-5 transition-colors"
                  :class="
                    dnaScores.movie > 0
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  "
                />

                <!-- Checkmark if goal met -->
                <div
                  v-if="dnaScores.movie >= PROGRESS_GOAL_PER_TYPE"
                  class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background"
                ></div>
              </div>
              <div
                class="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                  :style="{
                    width: `${Math.min((dnaScores.movie / PROGRESS_GOAL_PER_TYPE) * 100, 100)}%`,
                  }"
                />
              </div>
            </div>

            <!-- TV -->
            <div class="flex flex-col items-center gap-2 group">
              <div
                class="relative p-2.5 rounded-xl bg-background border border-border/50 shadow-sm transition-all duration-300"
                :class="{
                  'border-orange-500/50 bg-orange-500/10 scale-110':
                    dnaScores.tv > 0,
                  'opacity-50 grayscale':
                    !user?.preferences?.categories?.includes('tv'),
                }"
              >
                <Tv
                  class="w-5 h-5 transition-colors"
                  :class="
                    dnaScores.tv > 0
                      ? 'text-orange-500'
                      : 'text-muted-foreground'
                  "
                />
                <div
                  v-if="dnaScores.tv >= PROGRESS_GOAL_PER_TYPE"
                  class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-background"
                ></div>
              </div>
              <div
                class="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                  :style="{
                    width: `${Math.min((dnaScores.tv / PROGRESS_GOAL_PER_TYPE) * 100, 100)}%`,
                  }"
                />
              </div>
            </div>

            <!-- Game -->
            <div class="flex flex-col items-center gap-2 group">
              <div
                class="relative p-2.5 rounded-xl bg-background border border-border/50 shadow-sm transition-all duration-300"
                :class="{
                  'border-violet-500/50 bg-violet-500/10 scale-110':
                    dnaScores.game > 0,
                  'opacity-50 grayscale':
                    !user?.preferences?.categories?.includes('game'),
                }"
              >
                <Gamepad2
                  class="w-5 h-5 transition-colors"
                  :class="
                    dnaScores.game > 0
                      ? 'text-violet-500'
                      : 'text-muted-foreground'
                  "
                />
                <div
                  v-if="dnaScores.game >= PROGRESS_GOAL_PER_TYPE"
                  class="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full border-2 border-background"
                ></div>
              </div>
              <div
                class="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-500"
                  :style="{
                    width: `${Math.min((dnaScores.game / PROGRESS_GOAL_PER_TYPE) * 100, 100)}%`,
                  }"
                />
              </div>
            </div>

            <!-- Book -->
            <div class="flex flex-col items-center gap-2 group">
              <div
                class="relative p-2.5 rounded-xl bg-background border border-border/50 shadow-sm transition-all duration-300"
                :class="{
                  'border-blue-500/50 bg-blue-500/10 scale-110':
                    dnaScores.book > 0,
                  'opacity-50 grayscale':
                    !user?.preferences?.categories?.includes('book'),
                }"
              >
                <BookOpen
                  class="w-5 h-5 transition-colors"
                  :class="
                    dnaScores.book > 0
                      ? 'text-blue-500'
                      : 'text-muted-foreground'
                  "
                />
                <div
                  v-if="dnaScores.book >= PROGRESS_GOAL_PER_TYPE"
                  class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-background"
                ></div>
              </div>
              <div
                class="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  :style="{
                    width: `${Math.min((dnaScores.book / PROGRESS_GOAL_PER_TYPE) * 100, 100)}%`,
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
