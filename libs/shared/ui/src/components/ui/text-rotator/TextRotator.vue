<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const words = ['films', 'jeux vidéo', 'séries', 'livres', 'BDs'];
const currentIndex = ref(0);
const currentWord = ref(words[0]);

let intervalId: ReturnType<typeof setInterval> | null = null;

const rotateText = () => {
  currentIndex.value = (currentIndex.value + 1) % words.length;
  currentWord.value = words[currentIndex.value];
};

onMounted(() => {
  intervalId = setInterval(rotateText, 2500);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <span
    class="inline-flex relative overflow-hidden h-[1.2em] w-fit translate-y-[0.2em] align-bottom"
  >
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-500 ease-in absolute top-0 left-0"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-full opacity-0"
    >
      <span
        :key="currentWord"
        class="block font-bold text-primary whitespace-nowrap"
      >
        {{ currentWord }}
      </span>
    </Transition>
  </span>
</template>
