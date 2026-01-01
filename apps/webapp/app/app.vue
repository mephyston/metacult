<script setup lang="ts">
import { Header, Footer, Search } from '@metacult/shared-ui';
</script>

<template>
  <div class="font-sans min-h-screen flex flex-col bg-background text-foreground">
    <Header>
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
