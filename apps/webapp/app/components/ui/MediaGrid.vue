<script setup lang="ts">
import { type MediaItem } from '@metacult/shared-types';

const slots = defineSlots<{
  empty(): any;
  actions(props: { item: MediaItem }): any;
}>();

defineProps<{
  items: MediaItem[];
}>();

const emit = defineEmits<{
  (e: 'select', item: MediaItem): void;
}>();
</script>

<template>
  <div
    v-if="items.length > 0"
    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pb-20"
  >
    <div
      v-for="item in items"
      :key="item.id"
      class="group relative aspect-[2/3] bg-muted rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200"
      @click="emit('select', item)"
    >
      <!-- Image -->
      <img
        v-if="item.posterUrl"
        :src="item.posterUrl"
        :alt="item.title"
        class="w-full h-full object-cover transition-opacity duration-300"
        loading="lazy"
      />

      <!-- Gradient Overlay (Always visible on mobile bottom, hover on desktop) -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"
      />

      <!-- Actions Slot -->
      <div
        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        @click.stop
      >
        <slot name="actions" :item="item"></slot>
      </div>

      <!-- Content -->
      <div class="absolute bottom-0 left-0 right-0 p-3">
        <h3 class="text-white font-bold text-sm leading-tight line-clamp-2">
          {{ item.title }}
        </h3>
        <div class="flex items-center gap-2 mt-1">
          <span
            class="text-[10px] text-zinc-300 font-medium uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded"
          >
            {{ item.type }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-64"
  >
    <slot name="empty">
      <p class="text-lg font-medium">No items found</p>
    </slot>
  </div>
</template>
