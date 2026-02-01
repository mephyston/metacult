<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
import {
  Heart,
  X,
  Clock,
  ThumbsUp,
  Bookmark,
  Flame,
  Info,
  ExternalLink,
} from 'lucide-vue-next';
import MediaOffers from '../offers/MediaOffers.vue';

// --- Props & Emits ---
const props = defineProps<{
  item?: {
    id: string;
    title: string;
    image: string;
    mediaType?: string;
    type?: string;
    offers?: any[];
  };
  isGold?: boolean;
  affiliateUrl?: string;
}>();

const emit = defineEmits<{
  (
    e: 'swipe',
    payload: {
      action: 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'SKIP';
      sentiment?: string;
    },
  ): void;
}>();

// --- Refs & State ---
const cardRef = ref<HTMLElement | null>(null);
const { width: windowWidth } = useWindowSize();
const isFlipped = ref(false);

// Configuration physique
const THRESHOLD = 100; // Distance min pour valider
const MAX_ROTATION = 15; // Degrés max de rotation

// État du drag (delta depuis le point de départ)
const x = ref(0);
const y = ref(0);
const isDragging = ref(false);
const startPos = ref({ x: 0, y: 0 });

// --- Methods ---
const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};

const openAffiliate = () => {
  if (props.affiliateUrl) {
    window.open(props.affiliateUrl, '_blank');
  }
};

// Gestion manuelle du drag pour avoir le delta
const handlePointerDown = (e: MouseEvent | TouchEvent) => {
  // Disable drag if flipped to allow reading/scrolling back content
  if (isFlipped.value) return;

  const clientX =
    'touches' in e && e.touches.length > 0
      ? (e.touches[0]?.clientX ?? 0)
      : (e as MouseEvent).clientX;
  const clientY =
    'touches' in e && e.touches.length > 0
      ? (e.touches[0]?.clientY ?? 0)
      : (e as MouseEvent).clientY;

  startPos.value = { x: clientX, y: clientY };
  x.value = 0;
  y.value = 0;
  isDragging.value = true;

  e.preventDefault();
};

const handlePointerMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;

  const clientX =
    'touches' in e && e.touches.length > 0
      ? (e.touches[0]?.clientX ?? 0)
      : (e as MouseEvent).clientX;
  const clientY =
    'touches' in e && e.touches.length > 0
      ? (e.touches[0]?.clientY ?? 0)
      : (e as MouseEvent).clientY;

  x.value = clientX - startPos.value.x;
  y.value = clientY - startPos.value.y;

  e.preventDefault();
};

const lastTapTime = ref(0);

const handlePointerUp = () => {
  if (!isDragging.value) return;

  // Check for tap (minimal movement)
  // Increased threshold to 20px to accommodate slight finger movement during tap
  if (distance.value < 20) {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime.value;

    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap detected!
      toggleFlip();
    }
    lastTapTime.value = currentTime;
  }

  isDragging.value = false;
  handleRelease();
};

const handleBackClick = () => {
  const currentTime = Date.now();
  const timeDiff = currentTime - lastTapTime.value;

  if (timeDiff < 300 && timeDiff > 0) {
    toggleFlip();
  }
  lastTapTime.value = currentTime;
};

// Attache les listeners au montage
onMounted(() => {
  if (!cardRef.value) return;

  // Pointers events
  cardRef.value.addEventListener('mousedown', handlePointerDown);
  cardRef.value.addEventListener('touchstart', handlePointerDown, {
    passive: false,
  });

  document.addEventListener('mousemove', handlePointerMove);
  document.addEventListener('touchmove', handlePointerMove, { passive: false });

  document.addEventListener('mouseup', handlePointerUp);
  document.addEventListener('touchend', handlePointerUp);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handlePointerMove);
  document.removeEventListener('touchmove', handlePointerMove);
  document.removeEventListener('mouseup', handlePointerUp);
  document.removeEventListener('touchend', handlePointerUp);
});

// --- Computed Physics ---

// Distance du centre (0,0)
const distance = computed(() => Math.hypot(x.value, y.value));

// Opacité de l'overlay (0 à 1)
const overlayOpacity = computed(() => {
  return Math.min(distance.value / (THRESHOLD * 1.5), 0.8);
});

// Angle actuel (en degrés, 0 = Est, -90 = Nord)
const angle = computed(() => {
  if (distance.value < 10) return 0;
  return (Math.atan2(y.value, x.value) * 180) / Math.PI;
});

// Rotation de la carte (Tilt)
const cardTransform = computed(() => {
  // Tactile feedback: Scale down slightly when dragging
  const scale = isDragging.value ? 0.95 : 1;
  const flipRotate = isFlipped.value ? 180 : 0; // Handled by class, but keep cleanup if needed

  // N'applique RIEN si x et y sont à 0 ou quasi-0 (sauf le scale si on drag)
  if (distance.value < 3 && !isDragging.value) {
    return {
      transform: `scale(${scale})`, // CSS class handles rotateY
      transition: 'transform 0.3s ease-out',
    };
  }

  const rotate = (x.value / (windowWidth.value / 2)) * MAX_ROTATION;

  return {
    transform: `translate3d(${x.value}px, ${y.value}px, 0) rotate(${rotate}deg) scale(${scale})`,
    transition: isDragging.value
      ? 'none' // Instant response for drag
      : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring effect au retour
    cursor: isDragging.value ? 'grabbing' : 'grab',
  };
});

// Translation Label
const mediaTypeLabel = computed(() => {
  const type = props.item?.mediaType || props.item?.type || 'unknown';
  const normalized = type.toUpperCase();

  switch (normalized) {
    case 'MOVIE':
      return 'Film';
    case 'SHOW':
    case 'TV':
    case 'SERIE': // Handle potential variations
      return 'Série';
    case 'BOOK':
      return 'Livre';
    case 'GAME':
    case 'VIDEOGAME':
      return 'Jeu Vidéo';
    default:
      // Fallback: Si le type est "MEDIA" (générique) et qu'on n'a pas trouvé mieux, on ne retourne rien
      // Mais si c'est un autre string, on peut essayer de l'afficher proprement ?
      // Pour l'instant, on laisse null et on garde le log warning
      console.warn('[SwipeCard] Unknown/Unhandled media type:', {
        type,
        normalized,
        item: props.item,
      });
      return null;
  }
});

// Debug
onMounted(() => {
  if (!mediaTypeLabel.value) {
    console.log('[SwipeCard] Badge not showing for:', props.item);
  }
});

// --- Zone Logic ---

type Zone = {
  id: string;
  label: string;
  icon: any;
  color: string; // Tailwind class approx or hex
  bgGradient: string;
  action: 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'SKIP';
  sentiment?: string;
  range: [number, number]; // [minDeg, maxDeg]
};

const zones: Zone[] = [
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Bookmark,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/50',
    action: 'WISHLIST',
    range: [-135, -45], // Haut (90° ± 45)
  },
  {
    id: 'like',
    label: "J'aime",
    icon: ThumbsUp,
    color: 'text-green-400',
    bgGradient: 'from-green-500/50',
    action: 'LIKE',
    range: [-44, 45], // Droite (0° ± 45)
  },
  {
    id: 'skip',
    label: 'Plus tard',
    icon: Clock,
    color: 'text-gray-400',
    bgGradient: 'from-gray-500/50',
    action: 'SKIP',
    range: [46, 135], // Bas (90° ± 45)
  },
  {
    id: 'dislike',
    label: 'Pas pour moi',
    icon: X,
    color: 'text-red-500',
    bgGradient: 'from-red-500/50',
    action: 'DISLIKE',
    range: [136, 180], // Gauche (180° ± 45) - Partie 1
  },
];

// Détection de la zone active
// Détection de la zone active
const activeZone = computed(() => {
  if (distance.value < 40) return null; // Deadzone au centre

  // Normalisation de l'angle pour gérer le saut 180/-180
  let normalizedAngle = angle.value;

  // Cas spécial pour la gauche (Dislike) qui couvre la coupure +180/-180
  // Le range dislike est [136, 180]. On doit aussi capturer [-180, -136].
  if (normalizedAngle > 135 || normalizedAngle < -135) {
    return zones.find((z) => z.id === 'dislike');
  }

  return zones.find(
    (z) => normalizedAngle >= z.range[0] && normalizedAngle <= z.range[1],
  );
});

// --- Actions ---

const handleRelease = () => {
  if (activeZone.value && distance.value > THRESHOLD) {
    // Validé ! On envoie la carte au loin
    const endX = Math.cos((angle.value * Math.PI) / 180) * 1000;
    const endY = Math.sin((angle.value * Math.PI) / 180) * 1000;

    // Animation de sortie manuelle via style direct avant reset
    if (cardRef.value) {
      cardRef.value.style.transition = 'transform 0.4s ease-out';
      cardRef.value.style.transform = `translate3d(${endX}px, ${endY}px, 0) rotate(${MAX_ROTATION}deg)`;
    }

    // Emit event après court délai visuel
    setTimeout(() => {
      emit('swipe', {
        action: activeZone.value!.action,
        sentiment: activeZone.value!.sentiment,
      });
      // Reset position pour la prochaine carte (recyclage du composant)
      x.value = 0;
      y.value = 0;
      // IMPORTANT: Reset les styles inline pour éviter que la carte reste invisible
      if (cardRef.value) {
        cardRef.value.style.transform = '';
        cardRef.value.style.transition = '';
      }
    }, 200);
  } else {
    // Annulé : Retour au centre (géré par le CSS transition dans computed)
    x.value = 0;
    y.value = 0;
    // Nettoie les styles inline pour éviter les interférences avec cardTransform
    if (cardRef.value) {
      cardRef.value.style.transform = '';
      cardRef.value.style.transition = '';
    }
  }
};

// Méthode exposée pour déclencher le swipe programmatiquement
const triggerSwipe = (
  action: 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'SKIP',
  sentiment?: string,
) => {
  if (!cardRef.value) return;

  // Détermine la direction selon l'action
  let endX = 0;
  let endY = 0;
  let rotation = MAX_ROTATION;

  switch (action) {
    case 'WISHLIST':
      endX = 0;
      endY = -1000;
      rotation = 0;
      break;
    case 'SKIP':
      endX = 0;
      endY = 1000;
      rotation = 0;
      break;
    case 'DISLIKE':
      endX = -1000;
      endY = 0;
      rotation = -MAX_ROTATION;
      break;
    case 'LIKE':
      endX = 1000;
      endY = 0;
      rotation = MAX_ROTATION;
      break;
  }

  // Applique l'animation de sortie
  cardRef.value.style.transition = 'transform 0.4s ease-out';
  cardRef.value.style.transform = `translate3d(${endX}px, ${endY}px, 0) rotate(${rotation}deg)`;

  // Émet l'event après l'animation
  setTimeout(() => {
    emit('swipe', { action, sentiment });
    // Reset pour la prochaine carte
    x.value = 0;
    y.value = 0;
    if (cardRef.value) {
      cardRef.value.style.transform = '';
      cardRef.value.style.transition = '';
    }
  }, 200);
};

// Expose la méthode pour usage externe
defineExpose({
  triggerSwipe,
});
</script>

<template>
  <div
    class="relative w-full h-full select-none perspective-container"
    style="touch-action: none"
  >
    <div
      v-if="!item"
      class="absolute inset-0 flex items-center justify-center text-muted-foreground animate-pulse font-display text-xl"
    >
      Loading...
    </div>

    <!-- 
      3D FLIP CONTAINER
      - Preserves 3D transform
      - Handles rotation state
    -->
    <div
      v-else
      ref="cardRef"
      class="w-full h-full relative transition-transform duration-500 transform-style-3d cursor-grab active:cursor-grabbing z-10"
      :class="{ flipped: isFlipped }"
      :style="cardTransform"
    >
      <!-- FRONT FACE -->
      <div
        class="absolute inset-0 w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl backface-hidden"
        :class="{ 'ring-2 ring-amber-400 shadow-amber-900/40': isGold }"
      >
        <!-- GOLD SHIMMER EFFECT -->
        <div
          v-if="isGold"
          class="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl"
        >
          <div
            class="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/20 to-transparent translate-x-[-100%] animate-shimmer"
          />
        </div>

        <!-- FULL BLEED IMAGE -->
        <img
          :src="item.image"
          :alt="item.title"
          class="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable="false"
        >

        <!-- GRADIENT OVERLAY (Cinematic Fade) -->
        <div
          class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"
        />

        <!-- FLOATING METADATA (Bottom Left) -->
        <div
          class="absolute bottom-10 left-6 right-6 pointer-events-none flex flex-col gap-2 z-30"
        >
          <!-- Tags / Rating -->
          <div class="flex items-center gap-2 mb-1">
            <span
              v-if="isGold"
              class="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider"
            >
              Sponsored
            </span>
            <span
              v-else-if="mediaTypeLabel"
              class="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white"
            >
              {{ mediaTypeLabel }}
            </span>
            <span
              class="text-amber-400 text-xs font-bold flex items-center gap-1"
            >
              <Flame class="w-3 h-3" /> 8.8
            </span>
          </div>

          <!-- Title -->
          <h2
            class="text-4xl font-black font-display text-white leading-[0.9] drop-shadow-lg"
          >
            {{ item.title }}
          </h2>

          <!-- Short Description -->
          <p
            class="text-sm text-zinc-300 line-clamp-2 leading-snug mt-2 font-normal opacity-90"
          >
            Swipe to decide. Discovery awaits.
          </p>
        </div>

        <!-- BUTTONS (Info & CTA) -->
        <div class="absolute bottom-4 right-4 z-40 flex gap-3 items-center">
          <!-- OFFERS LINK (Commercial) -->
          <MediaOffers
            v-if="item.offers"
            :offers="item.offers"
            :media-title="item.title"
            variant="card"
          />

          <!-- INFO BUTTON (Flip Trigger) -->
          <button
            class="w-10 h-10 shrink-0 aspect-square rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-lg"
            aria-label="More Info"
            @touchstart.stop.prevent="toggleFlip"
            @click.stop.prevent="toggleFlip"
          >
            <Info class="w-5 h-5" />
          </button>

          <!-- GOLD CTA -->
          <button
            v-if="isGold && affiliateUrl"
            title="Voir l'offre exclusive"
            class="w-10 h-10 shrink-0 aspect-square rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/20 flex items-center justify-center"
            @touchstart.stop.prevent="openAffiliate"
            @click.stop.prevent="openAffiliate"
          >
            <ExternalLink class="w-5 h-5" />
          </button>
        </div>

        <!-- INTERACTION OVERLAY (Sentiment feedback) -->
        <div
          class="absolute inset-0 flex flex-col items-center justify-center transition-colors duration-200 pointer-events-none z-20"
          :class="
            activeZone
              ? `bg-gradient-to-tr ${activeZone.bgGradient} to-transparent`
              : ''
          "
          :style="{ opacity: isDragging ? overlayOpacity : 0 }"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            enter-from-class="opacity-0 scale-50 rotate-12"
            enter-to-class="opacity-100 scale-150 rotate-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-150"
            leave-to-class="opacity-0 scale-50"
          >
            <div
              v-if="activeZone"
              class="transform p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
            >
              <component
                :is="activeZone.icon"
                class="w-16 h-16"
                :class="activeZone.color"
                stroke-width="2.5"
              />
            </div>
          </Transition>

          <p
            v-if="activeZone"
            class="mt-4 text-3xl font-black font-display text-white tracking-widest uppercase drop-shadow-xl"
          >
            {{ activeZone.label }}
          </p>
        </div>
      </div>

      <!-- BACK FACE (Info) -->
      <div
        class="absolute inset-0 w-full h-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl backface-hidden rotate-y-180 p-8 flex flex-col border border-zinc-800"
        @click="handleBackClick"
      >
        <!-- Header (Back) -->
        <div class="flex justify-between items-start mb-6">
          <h3 class="text-2xl font-bold font-display text-white">
            {{ item.title }}
          </h3>
          <button
            class="p-2 -mr-2 text-zinc-400 hover:text-white"
            @touchstart.stop.prevent="toggleFlip"
            @click.stop.prevent="toggleFlip"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Content Scroll -->
        <div class="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
          <div>
            <h4
              class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1"
            >
              Synopsis
            </h4>
            <p class="text-sm text-zinc-300 leading-relaxed">
              This is a placeholder synopsis. In a real implementation, this
              would come from the item's metadata description field. It provides
              context without spoiling the plot.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4
                class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1"
              >
                Release Date
              </h4>
              <p class="text-sm text-white">
                2024
              </p>
            </div>
            <div>
              <h4
                class="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1"
              >
                Genre
              </h4>
              <p class="text-sm text-white">
                Sci-Fi
              </p>
            </div>
          </div>

          <div v-if="isGold && affiliateUrl">
            <div
              class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-4"
            >
              <p class="text-amber-400 text-xs font-bold mb-2 uppercase">
                Partenaire
              </p>
              <button
                class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-sm uppercase tracking-wider transition-colors"
                @click.stop="openAffiliate"
              >
                Voir l'offre exclusive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-container {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
  /* Safari fix */
  -webkit-backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.flipped {
  transform: rotateY(180deg) !important;
  /* Override drag transform when flipped? Or handle logic */
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2.5s infinite;
}

/* Hide scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
