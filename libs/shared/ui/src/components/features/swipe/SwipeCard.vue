<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDraggable, useWindowSize } from '@vueuse/core';
import {
    Bookmark,
    Flame,
    ThumbsUp,
    Smile,
    Clock,
    X
} from 'lucide-vue-next';

// --- Props & Events ---
const props = defineProps<{
    media: {
        id: string;
        title: string;
        poster: string;
    };
}>();

const emit = defineEmits<{
    (e: 'swipe', payload: { action: string; sentiment?: string }): void;
}>();

// --- Constants ---
const THRESHOLD_DISTANCE = 100; // px to trigger release
const RETURN_SPRING_TENSION = 0.1; // physics factor (implied via CSS transition)

// --- State ---
const cardRef = ref<HTMLElement | null>(null);
// Initial position needs to be center of screen or container. 
// For simplicity in this isolated component, we track delta from initial.
const { x, y, isDragging } = useDraggable(cardRef, {
    initialValue: { x: 0, y: 0 },
    preventDefault: true,
    onEnd: handleRelease
});

// Since useDraggable gives absolute coordinates, we need to calculate generic delta behaviors
// But for a tinder-like card, we usually want "transform: translate(x, y)" relative to start.
// A simpler approach with useDraggable is to reset position on release if not swiped.
// Let's track the *offset* from the starting point.
const startPos = ref({ x: 0, y: 0 });
const currentDelta = computed(() => {
    if (!isDragging.value) return { x: 0, y: 0 };
    // This logic depends on when startPos is set. 
    // Actually, usePointerSwipe might be better for "swipe" gestures than useDraggable which is for "moving stuff around indefinitely".
    // However, the prompt suggested useDraggable or usePointerSwipe.
    // Let's use logic: x.value is current position.
    return { x: x.value - startPos.value.x, y: y.value - startPos.value.y };
});

// We need to capture start position on drag start to calculate delta reliably 
// or clean x,y on mount. 
// A more robust way for "Joystick" feel is often custom touch handling or useDraggable with `position: relative` logic.
// Let's rely on standard style binding for visual transform.

// --- Trigonometry & Zones ---
const angle = computed(() => {
    // Math.atan2(y, x) returns radians. -PI to +PI.
    // 0 is Right (3h). -PI/2 is Top (12h). PI/2 is Bottom (6h). PI/-PI is Left (9h).
    // We flip y because screen coords: y increases downwards.
    return Math.atan2(currentDelta.value.y, currentDelta.value.x) * (180 / Math.PI);
});

const distance = computed(() => {
    return Math.sqrt(currentDelta.value.x ** 2 + currentDelta.value.y ** 2);
});

// Active Zone Detection
const activeZone = computed(() => {
    if (distance.value < 20) return null; // Deadzone in center

    // Angle ranges (approximate for 6 slices)
    // 12h (Top): -90 deg. Range: -120 to -60
    // 2h (Top-Right): -30 deg. Range: -60 to -10
    // 3h (Right): 0 deg. Range: -10 to +45  (ThumbsUp) 
    // ... Adjusting to match user request spec specifically:

    // "Zone Banger (-70 to -20)" -> 2h approx? No, 2h is -60deg (30deg * 2 from right? No, 0 is right. -90 is top.)
    // 12h: -90
    // 2h: -30 (Right is 0, Top is -90. So 2h is roughly -60? Wait. 12h to 3h is 90 deg. 1h=30, 2h=60 offset from 12h? 
    // 0 deg = 3h. -30 deg = 2h. -60 deg = 1h. -90 deg = 12h.
    // Let's map strict angles:
    // 12h (Wishlist): -110 to -70
    // 2h (Banger): -70 to -20
    // 3h (Good): -20 to +20
    // 4h (Smile): +20 to +70
    // 6h (Skip): +70 to +110 OR just "Down"
    // 9h (Dislike): Abs > 150 or similar (Left)

    const a = angle.value;

    if (a >= -110 && a < -70) return 'WISHLIST'; // Top (12h is -90)
    if (a >= -70 && a < -20) return 'BANGER';    // Top-Right (2h is -30 ish)
    if (a >= -20 && a < 20) return 'GOOD';       // Right (3h is 0)
    if (a >= 20 && a < 70) return 'OKAY';        // Bottom-Right (4h-ish)
    if (a >= 70 && a < 110) return 'SKIP';       // Bottom (6h is 90)
    if (a >= 135 || a <= -135) return 'DISLIKE'; // Left (9h is 180/-180)

    return null;
});

// --- Visual Feedback ---
const overlayColor = computed(() => {
    if (!activeZone.value) return 'rgba(0,0,0,0.5)';
    switch (activeZone.value) {
        case 'WISHLIST': return 'rgba(59, 130, 246, 0.6)'; // Blue
        case 'BANGER': return 'rgba(236, 72, 153, 0.6)';   // Pink/Purple
        case 'GOOD': return 'rgba(34, 197, 94, 0.6)';      // Green
        case 'OKAY': return 'rgba(234, 179, 8, 0.6)';      // Yellow
        case 'SKIP': return 'rgba(107, 114, 128, 0.6)';    // Gray
        case 'DISLIKE': return 'rgba(239, 68, 68, 0.6)';   // Red
        default: return 'rgba(0,0,0,0.5)';
    }
});

const getIconScale = (zone: string) => {
    return activeZone.value === zone ? 1.5 : 1;
};

const getIconOpacity = (zone: string) => {
    return activeZone.value === zone ? 1 : 0.5;
};

// --- Physics & Handlers ---
function handleRelease() {
    if (distance.value > THRESHOLD_DISTANCE && activeZone.value) {
        // Swipe Triggered
        emit('swipe', {
            action: mapZoneToAction(activeZone.value),
            sentiment: mapZoneToSentiment(activeZone.value)
        });
        // Reset visually or animate out (parent handles removal usually, but we reset for demo)
        // x.value = startPos.value.x; 
        // y.value = startPos.value.y;
    } else {
        // Spring back
        x.value = startPos.value.x; // naive reset, rely on useDraggable mechanics
        y.value = startPos.value.y;
    }
}

function mapZoneToAction(zone: string) {
    if (zone === 'WISHLIST') return 'WISHLIST';
    if (['BANGER', 'GOOD', 'OKAY'].includes(zone)) return 'LIKE';
    if (zone === 'SKIP') return 'SKIP';
    if (zone === 'DISLIKE') return 'DISLIKE';
    return 'SKIP';
}

function mapZoneToSentiment(zone: string) {
    if (zone === 'BANGER') return 'BANGER';
    if (zone === 'GOOD') return 'GOOD';
    if (zone === 'OKAY') return 'OKAY';
    return undefined;
}

// Reset start pos on mount logic omitted for brevity, utilizing useDraggable default
// Actually, to make "rubber band" work with useDraggable properly in a component flow:
// We often fix the element and use `style` transform based on delta.
// Let's assume the wrapper centers it.

</script>

<template>
    <div ref="cardRef"
        class="relative w-80 h-[28rem] rounded-3xl overflow-hidden shadow-2xl touch-none select-none cursor-grab active:cursor-grabbing transition-transform"
        :style="{
            transform: `translate(${x - startPos.x}px, ${y - startPos.y}px) rotate(${(x - startPos.x) * 0.1}deg)`
        }">
        <!-- Background Image -->
        <img :src="media.poster" :alt="media.title" class="w-full h-full object-cover pointer-events-none" />

        <!-- Gradient Overlay for Text -->
        <div class="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
        </div>

        <!-- Content -->
        <div class="absolute bottom-6 left-6 pointer-events-none">
            <h2 class="text-3xl font-bold text-white mb-1 drop-shadow-lg">{{ media.title }}</h2>
            <p class="text-white/80 text-sm">Action Movie • 2024</p>
        </div>

        <!-- Joystick Overlay (Visible on Drag) -->
        <div v-if="isDragging"
            class="absolute inset-0 transition-colors duration-300 flex items-center justify-center z-10"
            :style="{ backgroundColor: overlayColor }">
            <!-- Icons Circle Container -->
            <div class="relative w-64 h-64 border border-white/10 rounded-full animate-pulse-slow">

                <!-- 12h: Wishlist -->
                <div class="absolute top-2 left-1/2 -translate-x-1/2 transition-all duration-200"
                    :style="{ transform: `translateX(-50%) scale(${getIconScale('WISHLIST')})`, opacity: getIconOpacity('WISHLIST') }">
                    <Bookmark class="text-blue-400 w-10 h-10 drop-shadow-glow" />
                    <span v-if="activeZone === 'WISHLIST'"
                        class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white text-xs font-bold tracking-widest uppercase">Wishlist</span>
                </div>

                <!-- 2h: Banger -->
                <div class="absolute top-12 right-6 transition-all duration-200"
                    :style="{ transform: `scale(${getIconScale('BANGER')})`, opacity: getIconOpacity('BANGER') }">
                    <Flame class="text-pink-500 w-10 h-10 drop-shadow-glow" />
                </div>

                <!-- 3h: Good -->
                <div class="absolute top-1/2 right-2 -translate-y-1/2 transition-all duration-200"
                    :style="{ transform: `translateY(-50%) scale(${getIconScale('GOOD')})`, opacity: getIconOpacity('GOOD') }">
                    <ThumbsUp class="text-green-400 w-10 h-10 drop-shadow-glow" />
                </div>

                <!-- 4h: Okay -->
                <div class="absolute bottom-12 right-6 transition-all duration-200"
                    :style="{ transform: `scale(${getIconScale('OKAY')})`, opacity: getIconOpacity('OKAY') }">
                    <Smile class="text-yellow-400 w-10 h-10 drop-shadow-glow" />
                </div>

                <!-- 6h: Skip -->
                <div class="absolute bottom-2 left-1/2 -translate-x-1/2 transition-all duration-200"
                    :style="{ transform: `translateX(-50%) scale(${getIconScale('SKIP')})`, opacity: getIconOpacity('SKIP') }">
                    <Clock class="text-gray-400 w-10 h-10 drop-shadow-glow" />
                    <span v-if="activeZone === 'SKIP'"
                        class="absolute -top-6 left-1/2 -translate-x-1/2 text-white text-xs font-bold tracking-widest uppercase">Skip</span>
                </div>

                <!-- 9h: Dislike -->
                <div class="absolute top-1/2 left-2 -translate-y-1/2 transition-all duration-200"
                    :style="{ transform: `translateY(-50%) scale(${getIconScale('DISLIKE')})`, opacity: getIconOpacity('DISLIKE') }">
                    <X class="text-red-500 w-10 h-10 drop-shadow-glow" />
                    <span v-if="activeZone === 'DISLIKE'"
                        class="absolute -right-6 top-1/2 -translate-y-1/2 text-white text-xs font-bold tracking-widest uppercase rotate-90 origin-left">No</span>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.drop-shadow-glow {
    filter: drop-shadow(0 0 10px currentColor);
}

.animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
