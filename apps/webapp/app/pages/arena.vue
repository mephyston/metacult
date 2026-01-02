<script setup lang="ts">
import { onMounted } from 'vue';
import { useDuel } from '../composables/useDuel';
import DuelArena from '../components/features/arena/DuelArena.vue';
import { Button } from '@metacult/shared-ui';
import { Loader2, Swords } from 'lucide-vue-next';

const { currentPair, loading, isEmpty, fetchPair, vote } = useDuel();

onMounted(() => {
  fetchPair();
});
</script>

<template>
  <div class="h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
    <!-- Loading State -->
    <div
      v-if="loading && !currentPair"
      class="flex flex-col items-center justify-center h-full space-y-4"
    >
      <Loader2 class="w-12 h-12 animate-spin text-primary" />
      <p class="text-muted-foreground text-lg animate-pulse">
        Recherche de dignes adversaires...
      </p>
    </div>

    <!-- Empty State (Insufficient Likes) -->
    <div
      v-else-if="isEmpty"
      class="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 max-w-md mx-auto"
    >
      <div class="p-6 bg-primary/10 rounded-full">
        <Swords class="w-16 h-16 text-primary" />
      </div>

      <div class="space-y-2">
        <h1 class="text-3xl font-black tracking-tight">Ton arène est vide !</h1>
        <p class="text-muted-foreground text-lg">
          Va liker plus de jeux dans le Radar pour construire ton tournoi et
          affiner ton classement.
        </p>
      </div>

      <Button as-child size="lg" class="w-full text-lg cursor-pointer">
        <NuxtLink to="/discover"> Aller au Radar </NuxtLink>
      </Button>
    </div>

    <!-- Active Arena -->
    <DuelArena v-else-if="currentPair" :pair="currentPair" @vote="vote" />
  </div>
</template>
