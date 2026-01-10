<script setup lang="ts">
import { computed, ref, shallowRef, onMounted, onUnmounted } from 'vue';
import { useVibrate, useWindowSize } from '@vueuse/core';
import type { DuelMedia } from '../../../composables/useDuel';
import DuelParticles from './DuelParticles.vue';

const props = defineProps<{
  pair: DuelMedia[];
}>();

const emit = defineEmits<{
  (e: 'vote', mediaId: string): void;
}>();

const { vibrate } = useVibrate({ pattern: [50] });
const { width: windowWidth, height: windowHeight } = useWindowSize();
const votingFor = ref<string | null>(null);
const peekingAt = ref<string | null>(null);
const particlesRef = shallowRef<InstanceType<typeof DuelParticles> | null>(
  null,
);

// Gesture State
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const dragCurrent = ref({ x: 0, y: 0 });
const hasSnapped = ref(false); // Track if we've crossed the threshold

const first = computed(() => props.pair?.[0]);
const second = computed(() => props.pair?.[1]);

// --- Drag / Gesture Logic ---
const isMobile = computed(() => windowWidth.value < 768); // Tailwind 'md' breakpoint

const dragPercentage = computed(() => {
  if (!isDragging.value) return 0;

  if (isMobile.value) {
    // Vertical Layout: Top vs Bottom
    // Drag Down (Positive) -> Favor Top (First)
    // Drag Up (Negative) -> Favor Bottom (Second)
    const deltaY = dragCurrent.value.y - dragStart.value.y;
    return Math.max(-1, Math.min(1, deltaY / (windowHeight.value * 0.5)));
  } else {
    // Horizontal Layout: Left vs Right
    // Drag Right (Positive) -> Favor Left (First) - Pulling left card over
    // Drag Left (Negative) -> Favor Right (Second) - Pulling right card over
    const deltaX = dragCurrent.value.x - dragStart.value.x;
    return Math.max(-1, Math.min(1, deltaX / (windowWidth.value * 0.5)));
  }
});

// Normalized intensity (0 to 1) regardless of direction
const dragIntensity = computed(() => Math.abs(dragPercentage.value));

// Haptic Tension Logic
// We track the last haptic trigger point to avoid spamming
const lastHapticPct = ref(0);

const startDrag = (event: MouseEvent | TouchEvent) => {
  if (votingFor.value) return;
  isDragging.value = true;
  hasSnapped.value = false;
  lastHapticPct.value = 0;

  let clientX = 0;
  let clientY = 0;

  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0]?.clientX ?? 0;
    clientY = event.touches[0]?.clientY ?? 0;
  } else if ('clientX' in event) {
    clientX = (event as MouseEvent).clientX;
    clientY = (event as MouseEvent).clientY;
  }

  dragStart.value = { x: clientX, y: clientY };
  dragCurrent.value = { x: clientX, y: clientY };
};

const updateDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;

  let clientX = 0;
  let clientY = 0;

  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0]?.clientX ?? 0;
    clientY = event.touches[0]?.clientY ?? 0;
  } else if ('clientX' in event) {
    clientX = (event as MouseEvent).clientX;
    clientY = (event as MouseEvent).clientY;
  }

  dragCurrent.value = { x: clientX, y: clientY };

  // Proportional Feedback: Haptic Tension
  const pct = Math.abs(dragPercentage.value);
  const threshold = 0.25;

  // 1. Snap Haptic at Threshold
  if (pct >= threshold && !hasSnapped.value) {
    vibrate([20]); // Crisp snap
    hasSnapped.value = true;
  } else if (pct < threshold && hasSnapped.value) {
    hasSnapped.value = false; // Reset if user pulls back
  }

  // 2. Rising Tension Haptics (every 5% after 5%)
  if (pct > 0.05 && pct < threshold) {
    // Check if we crossed a 5% increment since last haptic
    const step = 0.05;
    const currentStep = Math.floor(pct / step);
    const lastStep = Math.floor(lastHapticPct.value / step);

    if (currentStep > lastStep) {
      // Intentionally light vibration for tension
      // Pattern duration decreases as we get closer to threshold? Or just simple ticks.
      vibrate(5);
      lastHapticPct.value = pct;
    }
  } else if (pct < 0.05) {
    lastHapticPct.value = 0;
  }
};

const endDrag = () => {
  if (!isDragging.value) return;

  const threshold = 0.25; // 25% drag to commit
  const pct = dragPercentage.value;

  if (Math.abs(pct) > threshold) {
    // Commit Vote
    if (pct > 0 && first.value) {
      handleVote(first.value.id);
    } else if (pct < 0 && second.value) {
      handleVote(second.value.id);
    }
  }

  // Reset
  isDragging.value = false;
  hasSnapped.value = false;
  dragStart.value = { x: 0, y: 0 };
  dragCurrent.value = { x: 0, y: 0 };
};

// --- Hold to Peek Logic ---
const startPeek = (id: string) => {
  if (votingFor.value || isDragging.value) return; // No peeking while voting or dragging
  peekingAt.value = id;
};

const endPeek = () => {
  peekingAt.value = null;
};

// --- Vote Logic ---
const handleVote = (id: string, event?: MouseEvent) => {
  if (votingFor.value) return; // Prevent double vote

  votingFor.value = id;
  peekingAt.value = null; // Clear peek state
  vibrate(); // Haptic feedback

  // Trigger Burst
  if (particlesRef.value) {
    const x = event ? event.clientX : window.innerWidth / 2;
    const y = event ? event.clientY : window.innerHeight / 2;
    particlesRef.value.explode(x, y, '#ffffff');
  }

  // 600ms delay to let pinch/punch animation play
  setTimeout(() => {
    emit('vote', id);
    votingFor.value = null; // Reset for next pair
  }, 600);
};

// --- Helper for Dynamic Styles ---
const getCardStyle = (index: number, media: DuelMedia) => {
  const other = props.pair[index === 0 ? 1 : 0];
  const isFirst = index === 0;

  let width = '100%';
  let height = '100%';

  if (isMobile.value) {
    if (votingFor.value === media.id) {
      height = '100%';
    } else if (votingFor.value === other?.id) {
      height = '0%';
    } else {
      // Logic: 50 +/- drag
      // Index 0 (Top): 50 + drag.
      // Index 1 (Bottom): 50 - drag.
      height = 50 + (isFirst ? 1 : -1) * dragPercentage.value * 50 + '%';
    }
  } else {
    // Desktop: Horizontal
    if (votingFor.value === media.id) {
      width = '100%';
    } else if (votingFor.value === other?.id) {
      width = '0%';
    } else {
      // Index 0 (Left): 50 + drag.
      // Index 1 (Right): 50 - drag.
      width = 50 + (isFirst ? 1 : -1) * dragPercentage.value * 50 + '%';
    }
  }

  return { width, height };
};

// --- Helpers for Display ---
const getYear = (m: DuelMedia) => m.releaseYear?.value || 'N/A';
const getRating = (m: DuelMedia) =>
  m.rating?.value ? `${m.rating.value}/10` : '';
const getCreator = (m: DuelMedia) =>
  m.director || m.creator || m.developer || m.author || '';

// Attach global listeners for smoother drag handling (exiting element bounds)
onMounted(() => {
  window.addEventListener('mousemove', updateDrag);
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchmove', updateDrag, { passive: false });
  window.addEventListener('touchend', endDrag);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateDrag);
  window.removeEventListener('mouseup', endDrag);
  window.removeEventListener('touchmove', updateDrag);
  window.removeEventListener('touchend', endDrag);
});
</script>

<template>
  <div
    class="relative w-full h-full flex flex-col md:flex-row bg-black overflow-hidden select-none touch-none"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <DuelParticles ref="particlesRef" />

    <!-- Atmospheric Bleed Background -->
    <!-- Proportional Feedback: Color shifts based on direction
         Violet (Top/Left) vs Red/Orange (Bottom/Right)
    -->
    <div
      class="absolute inset-0 transition-opacity duration-200 pointer-events-none z-0"
      :style="{
        background:
          dragPercentage > 0
            ? 'linear-gradient(to bottom, #7c3aed, black)' // Violet favors First (Top)
            : 'linear-gradient(to top, #ef4444, black)', // Red favors Second (Bottom)
        opacity: dragIntensity * 0.9, // Increased opacity for drama
      }"
    ></div>

    <!-- VS Badge (Centré Absolu) -->
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-500 ease-out-expo"
      :class="{
        'opacity-0 scale-50':
          votingFor || peekingAt || (isDragging && dragIntensity > 0.1),
        'opacity-100 scale-100':
          !votingFor && !peekingAt && (!isDragging || dragIntensity <= 0.1),
        'scale-125': hasSnapped, // Visual 'Snap' indicator
      }"
    >
      <div
        class="bg-primary text-primary-foreground p-3 md:p-4 rounded-full shadow-2xl border-4 border-background flex items-center justify-center animate-pulse-slow"
      >
        <span
          class="font-black text-xl md:text-3xl italic tracking-tighter shadow-black/50 drop-shadow-md"
          >VS</span
        >
      </div>
    </div>

    <!-- Dynamic Cards Loop -->
    <div
      v-for="(media, index) in pair"
      :key="media.id"
      class="group relative cursor-pointer overflow-hidden border-background transition-all duration-500 ease-out-expo"
      :class="[
        votingFor === media.id ? 'z-20' : 'z-10',
        peekingAt === pair[index === 0 ? 1 : 0]?.id
          ? 'opacity-60 grayscale'
          : '',
        index === 0
          ? 'border-b-4 md:border-b-0 md:border-r-4'
          : 'border-t-4 md:border-t-0 md:border-l-4',
      ]"
      :style="getCardStyle(index, media)"
      @mousedown.stop="
        media && startPeek(media.id);
        startDrag($event);
      "
      @touchstart.passive.stop="
        media && startPeek(media.id);
        startDrag($event);
      "
      @mouseup="endPeek"
      @touchend="endPeek"
      @mouseleave="endPeek"
      @click="
        (e) => {
          !isDragging && media && handleVote(media.id, e);
        }
      "
    >
      <!-- Background Image -->
      <img
        :src="media.coverUrl || ''"
        :alt="media.title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out-expo will-change-transform"
        :class="{
          'scale-100': votingFor === media.id,
          'scale-110':
            peekingAt === media.id ||
            ((index === 0 ? 1 : -1) * dragPercentage > 0.1 && !votingFor),
          'group-hover:scale-105': !votingFor && !peekingAt && !isDragging,
        }"
      />

      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300"
        :class="{
          'opacity-90': peekingAt === media.id,
          'opacity-60': !peekingAt,
        }"
      />

      <!-- Content -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10"
      >
        <!-- Main Title -->
        <h2
          class="text-3xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-2xl font-impact transition-all duration-500 ease-out-expo"
          :class="{
            'scale-125 translate-y-0': votingFor === media.id,
            '-translate-y-8 scale-90': peekingAt === media.id,
            'translate-y-0': !votingFor && !peekingAt,
          }"
          style="font-family: 'Impact', sans-serif"
        >
          {{ media.title }}
        </h2>

        <!-- Action / Status Text -->
        <span
          class="mt-2 text-white/90 text-sm md:text-lg font-bold uppercase tracking-widest transition-all duration-300 transform"
          :class="{
            'opacity-100 translate-y-0 scale-110 text-primary':
              votingFor === media.id ||
              (index === 0 ? 1 : -1) * dragPercentage > 0.15,
            'opacity-0':
              peekingAt || (index === 0 ? 1 : -1) * dragPercentage < -0.1,
            'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0':
              !votingFor && !peekingAt && !isDragging,
          }"
        >
          {{ votingFor === media.id ? 'WINNER!' : 'TAP TO VOTE' }}
        </span>

        <!-- Details (Reveal on Peek) -->
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4 w-full px-8 flex flex-col items-center gap-2 transition-all duration-500 delay-75"
          :class="{
            'opacity-100 blur-0 translate-y-2': peekingAt === media.id,
            'opacity-0 blur-sm translate-y-12': peekingAt !== media.id,
          }"
        >
          <div class="h-px w-16 bg-white/30 mb-2"></div>
          <p class="text-white/80 text-lg font-medium">
            {{ getCreator(media) }}
          </p>
          <div
            class="flex items-center gap-4 text-white/60 text-sm tracking-wider uppercase"
          >
            <span>{{ getYear(media) }}</span>
            <span
              v-if="getRating(media)"
              class="flex items-center gap-1 text-primary"
            >
              <span class="i-lucide-star w-3 h-3 fill-current" />
              {{ getRating(media) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fallback pour Impact si non dispo */
.font-impact {
  font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.95;
    transform: scale(0.95);
  }
}

/* Custom Easing for Physics feel */
.ease-out-expo {
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-snap {
  animation: snap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes snap {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}
</style>
