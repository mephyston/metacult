<script setup lang="ts">
import { ref } from 'vue';
import SwipeCard from '../../components/features/swipe/SwipeCard.vue';
import { RefreshCw } from 'lucide-vue-next';

const currentItem = ref({
  id: '1',
  title: 'Inception',
  image:
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2576&auto=format&fit=crop',
});

const isGold = ref(true);
const affiliateUrl = ref(
  'https://www.amazon.com/Inception-Leonardo-DiCaprio/dp/B0047WJ11G',
);

const handleSwipe = (payload: any) => {
  console.log('Swipe:', payload);
  // Reset for testing
  setTimeout(() => {
    currentItem.value = { ...currentItem.value };
  }, 1000);
};

const toggleGold = () => {
  isGold.value = !isGold.value;
};
</script>

<template>
  <div
    class="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-start pt-12 p-4 overflow-y-auto"
  >
    <div class="w-full max-w-sm h-[600px] relative shrink-0">
      <SwipeCard
        :key="isGold ? 'gold' : 'normal'"
        :item="currentItem"
        :is-gold="isGold"
        :affiliate-url="affiliateUrl"
        @swipe="handleSwipe"
      />
    </div>

    <div class="mt-8 flex gap-4 shrink-0 z-50">
      <button
        class="px-4 py-2 bg-zinc-800 text-white rounded-lg flex items-center gap-2 hover:bg-zinc-700 transition shadow-lg border border-zinc-700"
        @click="toggleGold"
      >
        <RefreshCw class="w-4 h-4" /> Toggle Gold Mode:
        {{ isGold ? 'ON' : 'OFF' }}
      </button>
    </div>
  </div>
</template>
