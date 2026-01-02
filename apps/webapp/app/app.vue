<script setup lang="ts">
import { Header, Footer, Search } from '@metacult/shared-ui';
import { useAuthSession } from './composables/useAuthSession';

const { user, clearSession } = useAuthSession();

// Gérer le logout depuis le Header
const handleLogout = () => {
    clearSession();
};
</script>

<template>
  <div class="font-sans min-h-screen flex flex-col bg-background text-foreground">
    <Header :user="user" @logout="handleLogout">
      <template #search>
        <div class="contents">
          <Search />
        </div>
      </template>
    </Header>

    <main class="flex-1">
      <NuxtPage />
    </main>

    <Footer />
  </div>
</template>
