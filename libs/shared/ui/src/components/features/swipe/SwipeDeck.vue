<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import SwipeCard from './SwipeCard.vue'
import { X, Clock, Bookmark, ThumbsUp, Flame } from 'lucide-vue-next'

// --- Types ---
interface SwipeItem {
  id: string
  title: string
  image: string
  [key: string]: any
}

interface SwipePayload {
  action: 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'SKIP'
  sentiment?: 'BANGER' | 'GOOD' | 'OKAY'
}

interface InteractionPayload {
  mediaId: string
  action: 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'SKIP'
  sentiment?: 'BANGER' | 'GOOD' | 'OKAY'
  timestamp: number
}

// --- Props ---
const props = withDefaults(defineProps<{
  items: SwipeItem[]
  guestMode?: boolean
}>(), {
  guestMode: false
})

// --- Emits ---
const emit = defineEmits<{
  (e: 'interaction', payload: InteractionPayload): void
}>()

// --- State ---
const cardRef = ref()
const deck = ref<SwipeItem[]>([...props.items]) // Copie locale
const history = ref<InteractionPayload[]>([])

// --- Computed ---
const currentCard = computed(() => deck.value[0])
const isEmpty = computed(() => deck.value.length === 0)
const totalProcessed = computed(() => history.value.length)
const totalItems = computed(() => props.items.length)

// --- LocalStorage Helpers ---
const STORAGE_KEY = 'guest_swipes'

function saveToLocalStorage(interaction: InteractionPayload) {
  if (!props.guestMode) return
  
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    const swipes = existing ? JSON.parse(existing) : []
    swipes.push(interaction)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(swipes))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// --- Handlers ---
function handleSwipe(payload: SwipePayload) {
  if (!currentCard.value) return

  const interaction: InteractionPayload = {
    mediaId: currentCard.value.id,
    action: payload.action,
    sentiment: payload.sentiment,
    timestamp: Date.now()
  }

  // Add to history
  history.value.push(interaction)

  // Save to localStorage if guest mode
  saveToLocalStorage(interaction)

  // Emit event for parent (API call, analytics, etc.)
  emit('interaction', interaction)

  // Remove card from deck
  deck.value.shift()
}

function resetDeck() {
  deck.value = [...props.items]
  history.value = []
}

function triggerSwipe(action: 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'SKIP', sentiment?: 'BANGER' | 'GOOD' | 'OKAY') {
  if (cardRef.value && currentCard.value) {
    cardRef.value.triggerSwipe(action, sentiment)
  }
}

// --- Keyboard Shortcuts ---
const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } = useMagicKeys()

whenever(ArrowUp, () => triggerSwipe('WISHLIST'))
whenever(ArrowDown, () => triggerSwipe('SKIP'))
whenever(ArrowLeft, () => triggerSwipe('DISLIKE'))
whenever(ArrowRight, () => triggerSwipe('LIKE', 'GOOD'))

// --- Watch props changes ---
watch(() => props.items, (newItems) => {
  deck.value = [...newItems]
}, { deep: true })

// --- Expose Public API ---
defineExpose({
  resetDeck,
  triggerSwipe,
  history,
  deck,
  currentCard
})
</script>

<template>
  <div class="relative flex flex-col items-center justify-center w-full h-full gap-6">
    
    <!-- Card Display Area -->
    <div class="relative w-full max-w-sm h-[65vh] md:h-[550px] flex items-center justify-center">
      
      <!-- Current Card -->
      <div v-if="currentCard" class="absolute inset-0">
        <SwipeCard 
          ref="cardRef"
          :item="currentCard"
          @swipe="handleSwipe" 
        />
      </div>

      <!-- Empty State (Slot for customization) -->
      <div v-else class="flex items-center justify-center h-full">
        <slot name="empty" :reset="resetDeck" :history="history">
          <div class="text-center space-y-4 p-8">
            <p class="text-3xl">🎉</p>
            <p class="text-xl font-bold text-foreground">Tout vu !</p>
            <p class="text-sm text-muted-foreground">
              Vous avez swipé {{ totalProcessed }} cartes
            </p>
            <button 
              @click="resetDeck" 
              class="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Recommencer
            </button>
          </div>
        </slot>
      </div>

    </div>

    <!-- Action Buttons -->
    <div 
      v-if="currentCard"
      class="flex items-center justify-center gap-3 md:gap-5"
    >
      <!-- Dislike -->
      <button
        @click="triggerSwipe('DISLIKE')"
        class="group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/30 transition-all active:scale-95 hover:scale-110"
        title="Pas pour moi (←)"
        aria-label="Dislike"
      >
        <X class="w-6 h-6 text-red-500" stroke-width="2.5" />
      </button>

      <!-- Skip -->
      <button
        @click="triggerSwipe('SKIP')"
        class="group flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-500/10 hover:bg-gray-500/20 border-2 border-gray-500/30 transition-all active:scale-95 hover:scale-110"
        title="Plus tard (↓)"
        aria-label="Skip"
      >
        <Clock class="w-5 h-5 text-gray-500" stroke-width="2.5" />
      </button>

      <!-- Wishlist -->
      <button
        @click="triggerSwipe('WISHLIST')"
        class="group flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500/30 transition-all active:scale-95 hover:scale-110"
        title="Wishlist (↑)"
        aria-label="Wishlist"
      >
        <Bookmark class="w-5 h-5 text-blue-500" stroke-width="2.5" />
      </button>

      <!-- Like (Good) -->
      <button
        @click="triggerSwipe('LIKE', 'GOOD')"
        class="group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500/10 hover:bg-green-500/20 border-2 border-green-500/30 transition-all active:scale-95 hover:scale-110"
        title="Bien (→)"
        aria-label="Like"
      >
        <ThumbsUp class="w-6 h-6 text-green-500" stroke-width="2.5" />
      </button>

      <!-- Banger -->
      <button
        @click="triggerSwipe('LIKE', 'BANGER')"
        class="group flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border-2 border-purple-500/30 transition-all active:scale-95 hover:scale-110"
        title="Banger!"
        aria-label="Banger"
      >
        <Flame class="w-5 h-5 text-purple-500" stroke-width="2.5" />
      </button>
    </div>

    <!-- Progress Counter -->
    <div 
      v-if="totalItems > 0"
      class="flex items-center gap-3 text-sm text-muted-foreground"
    >
      <span class="font-medium">
        {{ totalProcessed }} / {{ totalItems }}
      </span>
      
      <!-- Progress Dots -->
      <div class="flex gap-1">
        <div 
          v-for="i in Math.min(totalItems, 10)" 
          :key="i"
          :class="[
            'w-1.5 h-1.5 rounded-full transition-all',
            i <= totalProcessed ? 'bg-primary scale-110' : 'bg-muted'
          ]"
        />
        <span v-if="totalItems > 10" class="text-xs ml-1">...</span>
      </div>
    </div>

    <!-- Keyboard Hints (Desktop) -->
    <div class="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
      <kbd class="px-2 py-1 bg-muted rounded border border-border">←</kbd>
      <kbd class="px-2 py-1 bg-muted rounded border border-border">↑</kbd>
      <kbd class="px-2 py-1 bg-muted rounded border border-border">↓</kbd>
      <kbd class="px-2 py-1 bg-muted rounded border border-border">→</kbd>
      <span class="ml-1">pour swiper</span>
    </div>

    <!-- Guest Mode Indicator -->
    <div 
      v-if="guestMode && currentCard"
      class="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-500"
    >
      <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
      <span>Mode invité – Sauvegarde locale active</span>
    </div>

  </div>
</template>
