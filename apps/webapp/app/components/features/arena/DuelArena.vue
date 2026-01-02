<script setup lang="ts">
import { computed } from 'vue';
import { Swords } from 'lucide-vue-next';
import type { DuelMedia } from '../../../composables/useDuel';

const props = defineProps<{
  pair: DuelMedia[];
}>();

const emit = defineEmits<{
  (e: 'vote', mediaId: string): void;
}>();

const first = computed(() => props.pair?.[0]);
const second = computed(() => props.pair?.[1]);
</script>

<template>
  <div class="relative w-full h-full flex flex-col md:flex-row bg-background">
    <!-- VS Badge (Centré Absolu) -->
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
    >
      <div
        class="bg-primary text-primary-foreground p-4 rounded-full shadow-xl border-4 border-background flex items-center justify-center animate-pulse-slow"
      >
        <span class="font-black text-2xl md:text-3xl italic tracking-tighter"
          >VS</span
        >
      </div>
    </div>

    <!-- Carte 1 -->
    <div
      v-if="first"
      class="group relative w-full h-1/2 md:h-full md:w-1/2 cursor-pointer overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-background"
      @click="emit('vote', first.id)"
    >
      <!-- Background Image -->
      <img
        :src="first.coverUrl || ''"
        :alt="first.title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300"
      />

      <!-- Content -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10"
      >
        <h2
          class="text-3xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-2xl font-impact translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          style="font-family: 'Impact', sans-serif"
        >
          {{ first.title }}
        </h2>
        <span
          class="mt-2 text-white/80 text-sm md:text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
        >
          Voter pour {{ first.title }}
        </span>
      </div>
    </div>

    <!-- Carte 2 -->
    <div
      v-if="second"
      class="group relative w-full h-1/2 md:h-full md:w-1/2 cursor-pointer overflow-hidden border-t-4 md:border-t-0 md:border-l-4 border-background"
      @click="emit('vote', second.id)"
    >
      <!-- Background Image -->
      <img
        :src="second.coverUrl || ''"
        :alt="second.title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300"
      />

      <!-- Content -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10"
      >
        <h2
          class="text-3xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-2xl font-impact translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          style="font-family: 'Impact', sans-serif"
        >
          {{ second.title }}
        </h2>
        <span
          class="mt-2 text-white/80 text-sm md:text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
        >
          Voter pour {{ second.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fallback pour Impact si non dispo */
.font-impact {
  font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.95;
    transform: scale(0.95);
  }
}
</style>
