<script setup lang="ts">
import { SwipeCard } from '@metacult/shared-ui';
import { ref, computed } from 'vue';

const items = [
    {
        id: 1,
        title: "The Last of Us Part II",
        image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2q4f.jpg",
        category: "Game",
        description: "Five years after their dangerous journey across the post-pandemic United States, Ellie and Joel have settled down in Jackson, Wyoming."
    },
    {
        id: 2,
        title: "Dune: Part Two",
        image: "https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        category: "Movie",
        description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family."
    },
    {
        id: 3,
        title: "Cyberpunk 2077",
        image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg",
        category: "Game",
        description: "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification."
    }
];

const currentIndex = ref(0);
const currentItem = computed(() => items[currentIndex.value]);

function handleSwipe(payload: { action: string; sentiment?: string }) {
    console.log(`Swiped on ${currentItem.value?.title}:`, payload);
    // Move to next card
    currentIndex.value += 1;
}

function resetDeck() {
    currentIndex.value = 0;
}
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- Main Content -->
        <main class="flex-1 flex flex-col items-center justify-center p-4">
            <h1 class="text-2xl font-bold text-foreground mb-8 text-center">Your Daily Mix</h1>

            <!-- Simple Deck Simulation for SwipeCard Demo -->
            <div class="relative w-80 h-[28rem] flex items-center justify-center">
                <div v-if="currentItem" class="absolute inset-0">
                    <SwipeCard :media="{
                        id: String(currentItem.id),
                        title: currentItem.title,
                        poster: currentItem.image
                    }" @swipe="handleSwipe" />
                </div>
                <div v-else class="text-center text-muted-foreground">
                    <p class="text-xl">All caught up!</p>
                    <button @click="resetDeck" class="mt-4 text-primary hover:underline">Start Over</button>
                </div>
            </div>
        </main>

    </div>
</template>
