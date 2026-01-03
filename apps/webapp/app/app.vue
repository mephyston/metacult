<script setup lang="ts">
import { Header, Footer, Search } from '@metacult/shared-ui';
import { useAuthSession } from './composables/useAuthSession';
import { useGuestSync } from './composables/useGuestSync';
import { useWebsiteUrl } from './composables/useApiUrl';

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

// Gérer le logout depuis le Header
const handleLogout = async () => {
  clearSession();

  // Force clean state by redirecting to Marketing Home
  // This is better for UX (Start Over)
  const websiteUrl = useWebsiteUrl();
  window.location.href = websiteUrl;
};
</script>

<template>
  <div
    class="font-sans min-h-screen flex flex-col bg-background text-foreground"
  >
    <Header :user="user" :labels="headerLabels" @logout="handleLogout">
      <template #search>
        <div class="contents">
          <Search />
        </div>
      </template>
    </Header>

    <main class="flex-1">
      <NuxtPage :keepalive="{ max: 10 }" />
    </main>

    <Footer />
  </div>
</template>
