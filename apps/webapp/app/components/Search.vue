<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const open = ref(false);
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    open.value = !open.value;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function handleOpen() {
  open.value = true;
}
</script>

<template>
  <div>
    <button
      class="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
      @click="handleOpen"
    >
      <span class="hidden lg:inline-flex">{{ $t('discover.searchLong') }}</span>
      <span class="inline-flex lg:hidden">{{ $t('discover.search') }}</span>
      <kbd
        class="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex"
      >
        <span class="text-xs">⌘</span>K
      </kbd>
    </button>

    <!-- Dialog Implementation will go here -->
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-black/80"
      @click="open = false"
    >
      <div
        class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
        @click.stop
      >
        <p>{{ $t('common.loading') }}</p>
      </div>
    </div>
  </div>
</template>
