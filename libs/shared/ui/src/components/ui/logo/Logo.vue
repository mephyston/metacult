<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  className?: string;
  variant?: 'default' | 'icon';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const classes = computed(() => {
  return props.className || '';
});
</script>

<template>
  <a
    href="/"
    class="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-primary transition-opacity hover:opacity-90"
    :class="classes"
  >
    <!-- Icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-8 h-8"
    >
      <path
        d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"
      />
    </svg>

    <!-- Text (only for default variant) -->
    <span v-if="variant === 'default'">Metacult</span>
  </a>
</template>
