<script setup lang="ts">
import { ref } from 'vue';
import ReviewCard from './ReviewCard.vue';

interface ReviewItem {
    id: string | number;
    title: string;
    image: string;
    category: string;
    description: string;
}

interface Props {
    items: ReviewItem[];
}

const props = defineProps<Props>();
const emit = defineEmits(['vote']);

const currentIndex = ref(0);

function handleVote(direction: 'left' | 'right') {
    const item = props.items[currentIndex.value];
    emit('vote', { item, direction });
    currentIndex.value++;
}
</script>

<template>
  <div class="review-deck relative w-full h-[600px] max-w-md mx-auto">
    <div v-if="currentIndex >= items.length" class="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-xl border border-gray-200 dashed">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">You're all caught up!</h3>
        <p class="text-gray-500">Check back later for more content to review.</p>
    </div>

    <template v-else>
        <template v-for="(item, index) in items" :key="item.id">
            <!-- ReviewCard handles its own display state based on active prop, or we control it via v-if order? 
                 Better to render ALL (for stack effect) but only interaction on top one?
                 Simple version: Only render current and next.
            -->
            <ReviewCard 
                v-if="index === currentIndex || index === currentIndex + 1"
                :title="item.title"
                :image="item.image"
                :category="item.category"
                :description="item.description"
                :active="index === currentIndex"
                :style="{ zIndex: items.length - index, transform: index > currentIndex ? 'scale(0.95) translateY(10px)' : '' }"
                @swipe-left="handleVote('left')"
                @swipe-right="handleVote('right')"
            />
        </template>
    </template>
  </div>
</template>
