<script setup lang="ts">
import { Header, Footer, Search } from '@metacult/shared-ui';
import { useAuthSession } from './composables/useAuthSession';
import { useGuestSync } from './composables/useGuestSync';
import { useWebsiteUrl, useApiUrl } from './composables/useApiUrl';
import pkg from '../package.json';

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
  clearSession();

  // Force clean state by redirecting to Marketing Home
  // This is better for UX (Start Over)
  const websiteUrl = useWebsiteUrl();
  window.location.href = websiteUrl;
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
</script>

<template>
  <div
    class="font-sans min-h-screen flex flex-col bg-background text-foreground"
  >
    <Header
      :user="user"
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

    <main class="flex-1">
      <NuxtPage :keepalive="{ max: 10 }" />
    </main>

    <Footer :version="displayVersion" :commit="displayCommit" />
  </div>
</template>
