<script setup lang="ts">
import { Header, Footer, Search, TabBar } from '@metacult/shared-ui';
import { useAuthSession } from './composables/useAuthSession';
import { useGuestSync } from './composables/useGuestSync';
import { useWebsiteUrl, useApiUrl } from './composables/useApiUrl';

// @ts-ignore - Nuxt i18n auto-import
const { t } = useI18n();

const headerLabels = {
  explorer: t('common.explore'),
  login: t('auth.login.title'),
  register: t('auth.register.title'),
  logout: t('common.logout'),
  openApp: t('common.openApp'),
  profile: t('common.profile'),
  settings: t('common.settings'),
};

const { user, clearSession } = useAuthSession();
const { initSync } = useGuestSync();

// Initialisation de la synchro invité (vérifie l'URL)
initSync();

const apiUrl = useApiUrl();

// Fetch trending highlights for Header Mega-Menu
// @ts-ignore - Nuxt auto-import
const { data: trendingHighlights } = useAsyncData(
  'trending-highlights',
  async () => {
    try {
      const [movie, tv, game, book] = await Promise.all([
        $fetch(
          `${apiUrl}/api/discovery/feed/trending?type=movie&limit=1`,
        ).catch(() => null),
        $fetch(`${apiUrl}/api/discovery/feed/trending?type=tv&limit=1`).catch(
          () => null,
        ),
        $fetch(`${apiUrl}/api/discovery/feed/trending?type=game&limit=1`).catch(
          () => null,
        ),
        $fetch(`${apiUrl}/api/discovery/feed/trending?type=book&limit=1`).catch(
          () => null,
        ),
      ]);

      const getFirstItem = (data: any) =>
        Array.isArray(data) && data.length > 0 ? data[0] : null;

      return {
        movie: getFirstItem(movie),
        tv: getFirstItem(tv),
        game: getFirstItem(game),
        book: getFirstItem(book),
      };
    } catch (e) {
      console.error('[App] Failed to fetch trending highlights:', e);
      return { movie: null, tv: null, game: null, book: null };
    }
  },
  {
    lazy: true,
    default: () => ({ movie: null, tv: null, game: null, book: null }),
  },
);

// Gérer le logout depuis le Header
const handleLogout = async () => {
  await clearSession();

  // Force clean state by redirecting to Marketing Home
  // This is better for UX (Start Over)
  window.location.href = useWebsiteUrl();
};

const config = useRuntimeConfig();

// Standardization logic
const sha = (config.public as any).commitSha || 'local';
const appVer = (config.public as any).appVersion;

// Inject window.__ENV__ for shared-ui utilities (Header, etc.)
if (import.meta.client) {
  window.__ENV__ = {
    PUBLIC_WEBAPP_URL: (config.public as any).webappUrl,
    PUBLIC_WEBSITE_URL: (config.public as any).websiteUrl,
    PUBLIC_API_URL: (config.public as any).apiUrl,
  };
}

// If appVersion is present (Production), use it. Otherwise 'Dev'.
const displayVersion = appVer ? `${appVer}` : 'vDev';
const displayCommit = `#${sha.substring(0, 7)}`;
// SEO Metadata
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} | Metacult`
      : 'Metacult - Match, Rank & Discover';
  },
});

useSeoMeta({
  title: 'Metacult - Match, Rank & Discover',
  ogTitle: 'Metacult - Match, Rank & Discover',
  description:
    'The ultimate platform to track, rank, and discover movies, games, and books with your friends.',
  ogDescription:
    'The ultimate platform to track, rank, and discover movies, games, and books with your friends.',
  ogImage: 'https://metacult.app/og-image.jpg',
  twitterCard: 'summary_large_image',
});

const route = useRoute();
const isOnboarding = computed(
  () =>
    route.path.startsWith('/onboarding') || route.query.mode === 'onboarding',
);
const isSwipe = computed(() => route.path.startsWith('/swipe'));
</script>

<template>
  <div
    class="font-sans min-h-screen flex flex-col bg-background text-foreground dark"
  >
    <div v-if="!isOnboarding" :class="{ 'hidden md:block': isSwipe }">
      <Header
        :user="user"
        context="app"
        :labels="headerLabels"
        :trendingHighlights="trendingHighlights"
        @logout="handleLogout"
      >
        <template #search>
          <div class="contents">
            <Search />
          </div>
        </template>
      </Header>
    </div>

    <div class="flex-1" :class="{ 'pb-16 md:pb-0': !isOnboarding || isSwipe }">
      <!-- Mobile Swipe Floating Search -->
      <div
        v-if="!isOnboarding && isSwipe"
        class="md:hidden absolute bottom-24 right-4 z-50 pointer-events-auto bg-background/80 backdrop-blur-md rounded-full shadow-lg border border-border"
      >
        <Search />
      </div>

      <NuxtPage :keepalive="{ max: 10 }" />
    </div>

    <TabBar v-if="!isOnboarding || isSwipe" />
    <Footer
      v-if="!isOnboarding"
      :version="displayVersion"
      :commit="displayCommit"
      class="hidden md:block"
    />
  </div>
</template>
