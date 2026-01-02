<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { SwipeCard } from '@metacult/shared-ui'
import { X, Clock, Bookmark, ThumbsUp, Flame } from 'lucide-vue-next'

// --- Mock Data ---
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
  },
  {
    id: 4,
    title: "Oppenheimer",
    image: "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    category: "Movie",
    description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II."
  },
  {
    id: 5,
    title: "Baldur's Gate 3",
    image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
    category: "Game",
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival."
  }
]

// --- State ---
const swipeCardRef = ref()
const currentIndex = ref(0)
const currentItem = computed(() => items[currentIndex.value])

// --- Handlers ---
function handleSwipe(payload: { action: string; sentiment?: string }) {
  console.log(`Swiped on ${currentItem.value?.title}:`, payload)
  currentIndex.value += 1
}

function resetDeck() {
  currentIndex.value = 0
}

// --- Keyboard Shortcuts ---
const keys = useMagicKeys()
const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Enter } = keys

if (ArrowUp) {
  whenever(ArrowUp, () => {
    if (swipeCardRef.value && currentItem.value) {
      swipeCardRef.value.triggerSwipe('WISHLIST')
    }
  })
}

if (ArrowDown) {
  whenever(ArrowDown, () => {
    if (swipeCardRef.value && currentItem.value) {
      swipeCardRef.value.triggerSwipe('SKIP')
    }
  })
}

if (ArrowLeft) {
  whenever(ArrowLeft, () => {
    if (swipeCardRef.value && currentItem.value) {
      swipeCardRef.value.triggerSwipe('DISLIKE')
    }
  })
}

if (ArrowRight) {
  whenever(ArrowRight, () => {
    if (swipeCardRef.value && currentItem.value) {
      swipeCardRef.value.triggerSwipe('LIKE', 'GOOD')
    }
  })
}

if (Enter) {
  whenever(Enter, () => {
    if (swipeCardRef.value && currentItem.value) {
      swipeCardRef.value.triggerSwipe('LIKE', 'BANGER')
    }
  })
}

// --- Gamepad Actions ---
const gamepadActions = [
  {
    id: 'dislike',
    label: 'Pas pour moi',
    icon: X,
    color: 'text-red-500 hover:text-red-600',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20',
    borderColor: 'border-red-500/30',
    action: () => swipeCardRef.value?.triggerSwipe('DISLIKE'),
    shortcut: '←'
  },
  {
    id: 'skip',
    label: 'Plus tard',
    icon: Clock,
    color: 'text-gray-500 hover:text-gray-600',
    bgColor: 'bg-gray-500/10 hover:bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    action: () => swipeCardRef.value?.triggerSwipe('SKIP'),
    shortcut: '↓'
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Bookmark,
    color: 'text-blue-500 hover:text-blue-600',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    action: () => swipeCardRef.value?.triggerSwipe('WISHLIST'),
    shortcut: '↑'
  },
  {
    id: 'good',
    label: 'Bien',
    icon: ThumbsUp,
    color: 'text-green-500 hover:text-green-600',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
    borderColor: 'border-green-500/30',
    action: () => swipeCardRef.value?.triggerSwipe('LIKE', 'GOOD'),
    shortcut: '→'
  },
  {
    id: 'banger',
    label: 'Banger!',
    icon: Flame,
    color: 'text-purple-500 hover:text-purple-600',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    action: () => swipeCardRef.value?.triggerSwipe('LIKE', 'BANGER'),
    shortcut: '⏎'
  }
]
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-6 md:gap-10">
    
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-3xl md:text-4xl font-black text-foreground mb-2">Découvrir</h1>
      <p class="text-sm md:text-base text-muted-foreground">
        Swipe ou utilisez les touches pour explorer
      </p>
    </div>

    <!-- Card Container -->
    <div class="relative w-full max-w-sm h-[60vh] md:h-[500px] flex items-center justify-center">
      <div v-if="currentItem" class="absolute inset-0">
        <SwipeCard 
          ref="swipeCardRef"
          :item="{
            id: String(currentItem.id),
            title: currentItem.title,
            image: currentItem.image
          }" 
          @swipe="handleSwipe" 
        />
      </div>
      <div v-else class="text-center text-muted-foreground space-y-4">
        <p class="text-2xl font-bold">Tout vu ! 🎉</p>
        <p class="text-sm">Vous avez exploré toutes les cartes</p>
        <button 
          @click="resetDeck" 
          class="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Recommencer
        </button>
      </div>
    </div>

    <!-- Gamepad Controls -->
    <div 
      v-if="currentItem"
      class="flex items-center justify-center gap-3 md:gap-6 flex-wrap max-w-2xl"
    >
      <button
        v-for="action in gamepadActions"
        :key="action.id"
        @click="action.action"
        :class="[
          'group relative flex flex-col items-center justify-center',
          'w-14 h-14 md:w-16 md:h-16 rounded-full',
          'border-2 transition-all duration-200',
          'active:scale-95 hover:scale-110',
          action.bgColor,
          action.borderColor
        ]"
        :title="action.label"
      >
        <component 
          :is="action.icon" 
          :class="['w-6 h-6 md:w-7 md:h-7', action.color]"
          stroke-width="2.5"
        />
        
        <!-- Label (Hidden on mobile, shown on hover for desktop) -->
        <span 
          class="absolute -bottom-8 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          :class="action.color"
        >
          {{ action.label }}
        </span>
        
        <!-- Keyboard Shortcut Badge -->
        <span 
          class="hidden md:block absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 bg-background border border-border rounded-md shadow-sm"
        >
          {{ action.shortcut }}
        </span>
      </button>
    </div>

    <!-- Keyboard Hint (Desktop Only) -->
    <div class="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
      <kbd class="px-2 py-1 bg-muted rounded border border-border">←</kbd>
      <kbd class="px-2 py-1 bg-muted rounded border border-border">↑</kbd>
      <kbd class="px-2 py-1 bg-muted rounded border border-border">↓</kbd>
      <kbd class="px-2 py-1 bg-muted rounded border border-border">→</kbd>
      <kbd class="px-2 py-1 bg-muted rounded border border-border">Enter</kbd>
      <span class="ml-2">pour naviguer</span>
    </div>

    <!-- Progress Indicator -->
    <div class="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{{ currentIndex }} / {{ items.length }}</span>
      <div class="flex gap-1">
        <div 
          v-for="(_, index) in items" 
          :key="index"
          :class="[
            'w-1.5 h-1.5 rounded-full transition-colors',
            index < currentIndex ? 'bg-primary' : 'bg-muted'
          ]"
        />
      </div>
    </div>

  </div>
</template>
