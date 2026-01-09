<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { Heart, X, Clock, ThumbsUp, Bookmark, Flame } from 'lucide-vue-next';

// --- Props & Emits ---
const props = defineProps<{
  item?: {
    id: string;
    title: string;
    image: string;
  };
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

// Configuration physique
const THRESHOLD = 100; // Distance min pour valider
const MAX_ROTATION = 15; // Degrés max de rotation

// État du drag (delta depuis le point de départ)
const x = ref(0);
const y = ref(0);
const isDragging = ref(false);
const startPos = ref({ x: 0, y: 0 });

// Gestion manuelle du drag pour avoir le delta
const handlePointerDown = (e: MouseEvent | TouchEvent) => {
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

const handlePointerUp = () => {
  if (!isDragging.value) return;

  isDragging.value = false;
  handleRelease();
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

  // N'applique RIEN si x et y sont à 0 ou quasi-0 (sauf le scale si on drag)
  if (distance.value < 3 && !isDragging.value) {
    return {
      transform: `scale(${scale})`,
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
    class="relative flex items-center justify-center w-full h-full select-none"
    style="touch-action: none"
  >
    <div
      v-if="!item"
      class="absolute text-muted-foreground animate-pulse font-display text-xl"
    >
      Loading...
    </div>

    <!-- 
      CINEMATIC IMMERSIVE CARD 
      - Full Bleed (No padding)
      - No visible border (Clean edges)
      - Floating Metadata
    -->
    <div
      v-else
      ref="cardRef"
      class="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing will-change-transform z-10"
      :style="cardTransform"
    >
      <!-- FULL BLEED IMAGE -->
      <img
        :src="item.image"
        :alt="item.title"
        class="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable="false"
      />

      <!-- GRADIENT OVERLAY (Cinematic Fade) -->
      <div
        class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"
      />

      <!-- FLOATING METADATA (Bottom Left) -->
      <div
        class="absolute bottom-10 left-6 right-6 pointer-events-none flex flex-col gap-2"
      >
        <!-- Tags / Rating -->
        <div class="flex items-center gap-2 mb-1">
          <span
            class="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white"
            >Movie</span
          >
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

        <!-- Short Description (Mocked for now) -->
        <p
          class="text-sm text-zinc-300 line-clamp-2 leading-snug mt-2 font-normal opacity-90"
        >
          Swipe to decide. Discovery awaits.
        </p>
      </div>

      <!-- INTERACTION OVERLAY (Sentiment feedback) -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center transition-colors duration-200 pointer-events-none"
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

      <!-- DEADZONE HINTS (Optional for Tutorial feel) -->
      <!-- <div class="absolute inset-0 border-[1px] border-white/5 pointer-events-none"></div> -->
    </div>
  </div>
</template>
