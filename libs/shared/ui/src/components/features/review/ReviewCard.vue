<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSwipe } from '@vueuse/core';
import Card from '../../ui/card/Card.vue';
// CardImage is removed, using simple img tag
// CardContent is available if needed but ReviewCard structure differs slightly, keeping Card only for container


interface Props {
  title: string;
  image: string;
  category?: string;
  description?: string;
  active?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['swipe-left', 'swipe-right']);

const cardRef = ref<HTMLElement | null>(null);

// Basic swipe logic (could be enhanced)
function startDrag(e: MouseEvent | TouchEvent) {
    // Implement drag logic if needed, or rely on buttons for MVP
}

function vote(direction: 'left' | 'right') {
    emit(`swipe-${direction}`);
}
</script>

<template>
  <div class="review-card absolute top-0 left-0 w-full h-full transition-all duration-300 ease-out transform"
       :class="{ 'opacity-100 scale-100 z-10': active, 'opacity-0 scale-95 z-0': !active }"
  >
    <Card class="h-full flex flex-col shadow-2xl">
        <div class="relative flex-1 overflow-hidden">
             <img :src="image" class="absolute inset-0 w-full h-full object-cover" />
             <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <span v-if="category" class="inline-block px-2 py-1 mb-2 text-xs font-bold uppercase tracking-wider bg-primary rounded">{{ category }}</span>
                  <h2 class="text-3xl font-bold leading-tight">{{ title }}</h2>
                  <p class="mt-2 text-gray-300 line-clamp-2">{{ description }}</p>
             </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="px-6 py-6 bg-white border-t border-gray-100 flex justify-center gap-6">
            <button 
                @click="vote('left')"
                class="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

             <button 
                class="w-12 h-12 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-gray-50 transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
            </button>


            <button 
                @click="vote('right')"
                class="w-16 h-16 rounded-full border-2 border-green-500 text-green-500 flex items-center justify-center hover:bg-green-50 transition-colors shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
        </div>
    </Card>
  </div>
</template>
