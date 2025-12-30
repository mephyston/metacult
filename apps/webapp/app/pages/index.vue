<script setup lang="ts">
import { ReviewDeck } from '@metacult/shared-ui';

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

function handleVote({ item, direction }: { item: { title: string }, direction: string }) {
    console.log(`Voted ${direction} on ${item.title}`);
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    
    <!-- Simple Header for App -->
    <header class="bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center sticky top-0 z-50">
        <div class="flex items-center gap-2 text-primary">
             <!-- Icon Logo -->
             <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
            </svg>
            <span class="font-bold text-xl tracking-tight">Metacult</span>
        </div>
        <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
             <!-- User Avatar Placeholder -->
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" >
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center p-4">
        <h1 class="text-2xl font-bold text-gray-800 mb-8 text-center">Your Daily Mix</h1>
        
        <ReviewDeck :items="items" @vote="handleVote" />
    </main>

  </div>
</template>
