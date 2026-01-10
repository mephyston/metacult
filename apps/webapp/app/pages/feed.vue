<script setup lang="ts">
import ActivityFeed from '../components/social/ActivityFeed.vue';
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <header
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <div class="px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold">Activity Feed</h1>
      </div>
    </header>

    <main class="max-w-md mx-auto pt-4 px-4">
      <ActivityFeed />
    </main>
  </div>
</template>
