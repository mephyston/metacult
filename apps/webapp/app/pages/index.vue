<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from '@metacult/shared-ui';
import {
  Eye,
  Swords,
  TrendingUp,
  Radar,
  Flame,
  Sparkles,
} from 'lucide-vue-next';
import { useAuthSession } from '../composables/useAuthSession';
import { useApiUrl, useWebsiteUrl } from '../composables/useApiUrl';
import { useLogger } from '../composables/useLogger';

// --- Auth & User Data ---
const { user } = useAuthSession();
const logger = useLogger();
// Use Nuxt composable for Split Horizon URL resolution
const apiUrl = useApiUrl();
const websiteUrl = useWebsiteUrl();

// --- Mock Stats (à remplacer par API si disponible) ---
const stats = ref({
  swipes: 124,
  duels: 45,
});

// --- Trends Data ---
const trends = ref<any[]>([]);
const isLoadingTrends = ref(true);

// Fetch community trends
const fetchTrends = async () => {
  logger.debug(
    '[Dashboard] Fetching trends from:',
    `${apiUrl}/api/media/trends`,
  );
  isLoadingTrends.value = true;
  try {
    const response = await fetch(`${apiUrl}/api/media/trends`, {
      credentials: 'include',
    });

    logger.debug('[Dashboard] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    logger.debug('[Dashboard] Trends received:', data.length, 'items');
    trends.value = data.slice(0, 5); // Limit to 5 trends
  } catch (error) {
    logger.error('[Dashboard] Failed to fetch trends:', error);
    trends.value = [];
  } finally {
    isLoadingTrends.value = false;
    logger.debug('[Dashboard] Loading complete, trends:', trends.value.length);
  }
};

// Display name with fallback
// Display name with fallback
const displayName = computed(() => {
  return (
    user.value?.username || user.value?.email?.split('@')[0] || 'Culturevore'
  );
});

// Format ELO score
const formatElo = (score?: number) => {
  return score ? Math.round(score).toLocaleString() : 'N/A';
};

// --- Lifecycle ---
onMounted(() => {
  logger.debug('[Dashboard] Component mounted, fetching trends...');
  fetchTrends();
});
</script>

<template>
  <div class="min-h-screen bg-background" data-testid="dashboard">
    <div class="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <!-- 1. Header Welcome -->
      <div class="mb-10">
        <h1
          class="text-3xl md:text-4xl font-black text-foreground mb-2 flex items-center gap-2"
        >
          {{ $t('dashboard.welcome', { name: displayName }) }}
          <span class="text-4xl">👋</span>
        </h1>
        <p class="text-base md:text-lg text-muted-foreground">
          {{ $t('dashboard.subtitle') }}
        </p>
      </div>

      <!-- 2. Section Stats (KPIs) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
        <!-- Radar Card -->
        <Card
          class="border-2 hover:border-primary/50 transition-colors cursor-default"
        >
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="p-3 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <Eye class="w-6 h-6 text-primary" stroke-width="2.5" />
                </div>
                <div>
                  <CardTitle class="text-2xl md:text-3xl font-black">{{
                    stats.swipes
                  }}</CardTitle>
                  <CardDescription class="text-sm">{{
                    $t('dashboard.stats.radar', { count: stats.swipes })
                  }}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" class="text-xs">Radar</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">
              {{ $t('dashboard.stats.radarDescription') }}
            </p>
          </CardContent>
        </Card>

        <!-- Arène Card -->
        <Card
          class="border-2 hover:border-purple-500/50 transition-colors cursor-default"
        >
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="p-3 bg-purple-500/10 rounded-full flex items-center justify-center"
                >
                  <Swords class="w-6 h-6 text-purple-500" stroke-width="2.5" />
                </div>
                <div>
                  <CardTitle class="text-2xl md:text-3xl font-black">{{
                    stats.duels
                  }}</CardTitle>
                  <CardDescription class="text-sm">{{
                    $t('dashboard.stats.arena', { count: stats.duels })
                  }}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" class="text-xs">Arène</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">
              {{ $t('dashboard.stats.arenaDescription') }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- 3. Section Missions (Call to Action) -->
      <div class="mb-12">
        <h2
          class="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-2"
        >
          <Sparkles class="w-5 h-5 text-primary" />
          {{ $t('dashboard.missions.title') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <!-- Mission Radar -->
          <Card
            class="border-2 hover:border-primary transition-all hover:shadow-lg cursor-pointer group"
          >
            <CardHeader>
              <div class="flex items-center gap-3 mb-2">
                <Radar
                  class="w-8 h-8 text-primary group-hover:scale-110 transition-transform"
                />
                <CardTitle class="text-xl">{{
                  $t('dashboard.missions.radar.title')
                }}</CardTitle>
              </div>
              <CardDescription>
                {{ $t('dashboard.missions.radar.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NuxtLink to="/discover">
                <Button
                  size="lg"
                  class="w-full font-bold text-base group-hover:scale-105 transition-transform"
                >
                  {{ $t('dashboard.missions.radar.cta') }}
                </Button>
              </NuxtLink>
            </CardContent>
          </Card>

          <!-- Mission Arène -->
          <Card
            class="border-2 hover:border-purple-500 transition-all hover:shadow-lg cursor-pointer group"
          >
            <CardHeader>
              <div class="flex items-center gap-3 mb-2">
                <Swords
                  class="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform"
                />
                <CardTitle class="text-xl">{{
                  $t('dashboard.missions.arena.title')
                }}</CardTitle>
              </div>
              <CardDescription>
                {{ $t('dashboard.missions.arena.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NuxtLink to="/arena">
                <Button
                  size="lg"
                  variant="outline"
                  class="w-full font-bold text-base border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white group-hover:scale-105 transition-transform"
                >
                  {{ $t('dashboard.missions.arena.cta') }}
                </Button>
              </NuxtLink>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- 4. Section Teaser Reco -->
      <div>
        <h2
          class="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2"
        >
          <TrendingUp class="w-5 h-5 text-primary" />
          {{ $t('dashboard.trends.title') }}
        </h2>

        <!-- Trends Carousel -->
        <div v-if="isLoadingTrends" class="flex justify-center py-12">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
          ></div>
        </div>

        <div
          v-else-if="trends.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          <a
            v-for="trend in trends"
            :key="trend.id"
            :href="`${websiteUrl}/catalog/${trend.type}/${trend.slug}`"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all hover:shadow-lg cursor-pointer block"
          >
            <div class="aspect-[2/3] relative">
              <img
                :src="trend.coverUrl || '/placeholder-cover.jpg'"
                :alt="trend.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <h3 class="text-white text-sm font-bold line-clamp-2 mb-1">
                    {{ trend.title }}
                  </h3>
                  <div class="flex items-center gap-2">
                    <Badge
                      v-if="trend.eloScore"
                      variant="secondary"
                      class="text-xs bg-primary/90 text-primary-foreground"
                    >
                      <Flame class="w-3 h-3 mr-1" />
                      {{ formatElo(trend.eloScore) }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>

        <div v-else class="text-center py-12 text-muted-foreground">
          <p class="mb-2">{{ $t('dashboard.trends.empty') }}</p>
        </div>

        <!-- Teasing Phase 4 -->
        <div
          class="mt-8 p-6 bg-gradient-to-r from-primary/5 to-purple-500/5 border-2 border-dashed border-primary/30 rounded-lg text-center"
        >
          <p class="text-sm md:text-base text-muted-foreground italic">
            {{ $t('dashboard.trends.teaser') }}
          </p>
          <p class="text-xs text-muted-foreground/70 mt-1">
            {{ $t('dashboard.trends.teaserSubtitle') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
