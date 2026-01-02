<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
import {
  Heart,
  X,
  Clock,
  ThumbsUp,
  Flame,
  Bookmark,
  Smile,
  HelpCircle,
} from 'lucide-vue-next';

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
      sentiment?: 'BANGER' | 'GOOD' | 'OKAY';
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
  // N'applique RIEN si x et y sont à 0 ou quasi-0
  if (distance.value < 3) {
    return {};
  }

  const rotate = (x.value / (windowWidth.value / 2)) * MAX_ROTATION;

  return {
    transform: `translate3d(${x.value}px, ${y.value}px, 0) rotate(${rotate}deg)`,
    transition: isDragging.value
      ? 'none'
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
  sentiment?: 'BANGER' | 'GOOD' | 'OKAY';
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
    range: [-110, -70], // Haut (12h) - Ajusté large
  },
  {
    id: 'banger',
    label: 'Banger!',
    icon: Flame,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/50',
    action: 'LIKE',
    sentiment: 'BANGER',
    range: [-69, -20], // Haut-Droite
  },
  {
    id: 'good',
    label: 'Bien',
    icon: ThumbsUp,
    color: 'text-green-400',
    bgGradient: 'from-green-500/50',
    action: 'LIKE',
    sentiment: 'GOOD',
    range: [-19, 20], // Droite
  },
  {
    id: 'okay',
    label: 'Sympa',
    icon: Smile,
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500/50',
    action: 'LIKE',
    sentiment: 'OKAY',
    range: [21, 70], // Bas-Droite
  },
  {
    id: 'skip',
    label: 'Plus tard',
    icon: Clock,
    color: 'text-gray-400',
    bgGradient: 'from-gray-500/50',
    action: 'SKIP',
    range: [71, 110], // Bas
  },
  {
    id: 'dislike',
    label: 'Pas pour moi',
    icon: X,
    color: 'text-red-500',
    bgGradient: 'from-red-500/50',
    action: 'DISLIKE',
    range: [111, 180], // Gauche (et -180 à -111 géré par logique)
  },
];

// Détection de la zone active
const activeZone = computed(() => {
  if (distance.value < 40) return null; // Deadzone au centre

  // Normalisation de l'angle pour gérer le saut 180/-180
  let normalizedAngle = angle.value;

  // Cas spécial pour la gauche (Dislike) qui couvre la coupure +180/-180
  if (normalizedAngle > 110 || normalizedAngle < -110) {
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
  sentiment?: 'BANGER' | 'GOOD' | 'OKAY',
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
      endY = sentiment === 'BANGER' ? -200 : 0;
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
    <div v-if="!item" class="absolute text-muted-foreground animate-pulse">
      Chargement du deck...
    </div>

    <div
      v-else
      ref="cardRef"
      class="relative w-full max-w-sm aspect-[3/4] bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/50 cursor-grab active:cursor-grabbing will-change-transform z-10"
      :style="cardTransform"
    >
      <img
        :src="item.image"
        :alt="item.title"
        class="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable="false"
      />

      <div
        class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"
      />

      <div class="absolute bottom-6 left-6 right-6 pointer-events-none">
        <h2 class="text-3xl font-black text-white leading-tight drop-shadow-md">
          {{ item.title }}
        </h2>
      </div>

      <div
        class="absolute inset-0 flex flex-col items-center justify-center transition-colors duration-200 pointer-events-none"
        :class="
          activeZone
            ? `bg-gradient-to-tr ${activeZone.bgGradient} to-transparent`
            : 'bg-black/40'
        "
        :style="{ opacity: isDragging ? overlayOpacity : 0 }"
      >
        <div
          v-if="activeZone"
          class="transform transition-all duration-200 scale-150 p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
        >
          <component
            :is="activeZone.icon"
            class="w-16 h-16"
            :class="activeZone.color"
            stroke-width="2.5"
          />
        </div>

        <p
          v-if="activeZone"
          class="mt-4 text-2xl font-bold text-white tracking-widest uppercase drop-shadow-lg"
        >
          {{ activeZone.label }}
        </p>
      </div>

      <div
        v-if="isDragging && distance < 50"
        class="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none"
      >
        <div class="grid grid-cols-2 gap-24">
          <X class="text-red-500" />
          <ThumbsUp class="text-green-500" />
        </div>
      </div>
    </div>
  </div>
</template>
