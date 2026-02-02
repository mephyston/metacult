<script setup lang="ts">
import { ref, computed } from 'vue';
// import { useRouter } from '#app'; // Auto-imported
import { useAuthSession } from '../../composables/useAuthSession';
import { useApiUrl } from '../../composables/useApiUrl';
import { Button } from '@metacult/shared-ui';
import {
  Check,
  Clapperboard,
  Gamepad2,
  Book,
  Tv,
  ChevronRight,
  Zap,
  X,
  Heart,
  Bookmark,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-vue-next';

// --- State ---
const step = ref(1);
const router = useRouter();
const { user, refreshSession } = useAuthSession();
const apiUrl = useApiUrl();
const isSubmitting = ref(false);

// --- Data ---
const CATEGORIES = [
  { id: 'movie', label: 'Films', icon: Clapperboard, color: 'text-blue-500' },
  { id: 'tv', label: 'Séries', icon: Tv, color: 'text-purple-500' },
  { id: 'game', label: 'Jeux Vidéo', icon: Gamepad2, color: 'text-green-500' },
  { id: 'book', label: 'Livres', icon: Book, color: 'text-yellow-500' },
];

const GENRES: Record<string, string[]> = {
  movie: [
    'Action',
    'Aventure',
    'Comédie',
    'Drame',
    'Fantastique',
    'Horreur',
    'Sci-Fi',
    'Thriller',
  ],
  tv: [
    'Action',
    'Animation',
    'Comédie',
    'Crime',
    'Documentaire',
    'Drame',
    'Famille',
    'Sci-Fi',
  ],
  game: [
    'Action',
    'Aventure',
    'RPG',
    'Stratégie',
    'Simulation',
    'Sport',
    'Course',
    'Puzzle',
  ],
  book: [
    'Biography',
    'Business',
    'Classics',
    'Comics',
    'Fantasy',
    'Fiction',
    'History',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller',
  ],
};

const selectedCategories = ref<string[]>([]);
// const selectedGenres = ref<string[]>([]); // Removed

// --- Computed ---
// const availableGenres = computed(() => { ... }); // Removed

const canProceedToGenres = computed(() => selectedCategories.value.length > 0);
const canFinishPreferences = computed(
  () => selectedCategories.value.length > 0,
); // Simplified

const headerSubtitle = computed(() => {
  return selectedCategories.value.length === 0
    ? 'Sélectionne au moins une catégorie'
    : 'Prêt à continuer ?';
});

// --- Actions ---
const toggleCategory = (id: string) => {
  if (selectedCategories.value.includes(id)) {
    selectedCategories.value = selectedCategories.value.filter((c) => c !== id);
  } else {
    selectedCategories.value.push(id);
  }
};

// const toggleGenre = ... // Removed

const nextStep = () => {
  if (step.value === 1) step.value = 2;
  else if (step.value === 2) savePreferences();
};

const savePreferences = async () => {
  if (!user.value) return;
  isSubmitting.value = true;

  try {
    // 1. Update Preferences
    await $fetch(`${apiUrl}/api/users/${user.value.id}`, {
      method: 'PATCH',
      body: {
        preferences: {
          categories: selectedCategories.value,
          genres: [], // Empty genres
        },
      },
      credentials: 'include',
    });

    step.value = 3;
  } catch (e) {
    console.error('Failed to save preferences', e);
  } finally {
    isSubmitting.value = false;
  }
};
// ... (finishOnboarding kept simplified)
const finishOnboarding = async () => {
  if (!user.value) return;
  isSubmitting.value = true;

  try {
    // Plan: "Modify apps/webapp/app/pages/swipe/index.vue ... Handle mode=onboarding ... Update onboardingCompleted = true after 10 swipes."
    // So we need to allow access to /swipe even if onboardingCompleted is false, IF a query param is present? Or just modify middleware to allow /swipe?
    // Middleware should likely allow /swipe if specific condition met.

    await router.push('/swipe?mode=onboarding');
  } catch (e) {
    console.error('Failed to finish', e);
  } finally {
    isSubmitting.value = false;
  }
};

// ... template updates ...
// In template, I will replace the genres section with just the continue button area or similar simplification.
// For replace_file_content, I need to target specific chunks. This block covered script. Now let's handle template in a separate call or try to capture it.
// Actually, I should probably do script and template separately or use multi_replace if they are far apart. They are.
// I'll start with the Script part.
</script>

<template>
  <div class="relative flex flex-col h-dvh overflow-hidden">
    <!-- Background elements -->
    <div class="absolute inset-0 z-0">
      <div
        class="absolute inset-0 bg-gradient-to-br from-background to-primary/10 opacity-50"
      ></div>
      <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
    </div>

    <transition name="fade" mode="out-in">
      <!-- Step 1: Welcome -->
      <div
        v-if="step === 1"
        class="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500"
      >
        <div
          class="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-float"
        >
          <Zap class="w-16 h-16 text-primary" />
        </div>

        <div class="space-y-4">
          <h1 class="text-4xl font-black">Bienvenue sur Metacult !</h1>
          <p class="text-muted-foreground text-lg">
            Pour commencer, dis-nous ce que tu aimes.
          </p>
        </div>

        <button
          @click="nextStep"
          class="px-8 py-4 bg-white text-black font-bold text-lg rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all w-full max-w-xs"
        >
          C'est parti !
          <ChevronRight class="inline-block ml-2" />
        </button>
      </div>

      <!-- Step 2: Categories & Genres -->
      <div
        v-else-if="step === 2"
        class="flex-1 flex flex-col p-0 text-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-500 h-full relative overflow-y-auto scrollbar-hide"
      >
        <!-- Sticky Header with Blur -->
        <div
          class="flex-none px-8 py-6 z-20 bg-background/85 backdrop-blur-xl sticky top-0 border-b border-white/5 shadow-sm"
        >
          <h1 class="text-4xl font-black mb-2">Tes préférences</h1>
          <p class="text-muted-foreground text-lg">{{ headerSubtitle }}</p>
        </div>

        <!-- Categories Selection -->
        <div class="px-8 pb-40 pt-4">
          <!-- Categories -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <button
              v-for="cat in CATEGORIES"
              :key="cat.id"
              @click="toggleCategory(cat.id)"
              class="aspect-square rounded-2xl bg-card border border-border flex flex-col items-center justify-center gap-3 p-4 hover:border-primary transition-all active:scale-95 text-center relative group"
              :class="{
                'ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5 border-primary':
                  selectedCategories.includes(cat.id),
              }"
            >
              <component
                :is="cat.icon"
                class="w-10 h-10 transition-transform group-hover:scale-110"
                :class="cat.color"
              />
              <span class="font-bold">{{ cat.label }}</span>
              <!-- Checkmark if selected -->
              <span
                v-if="selectedCategories.includes(cat.id)"
                class="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[12px] text-white shadow-sm animate-in zoom-in spin-in-12 duration-300"
              >
                <Check class="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="fixed bottom-0 left-0 right-0 p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] z-50 bg-gradient-to-t from-background via-background/95 to-transparent pt-12"
        >
          <button
            @click="nextStep"
            :disabled="!canFinishPreferences"
            class="w-full py-4 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform"
            :class="
              canFinishPreferences
                ? 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            "
          >
            Continuer
          </button>
        </div>
      </div>

      <!-- Step 3: Tutorial (4 Directions) -->
      <div
        v-else-if="step === 3"
        class="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-md mx-auto w-full"
      >
        <h1 class="text-3xl font-black mb-8">Comment ça marche ?</h1>

        <!-- 4 Directions Visual -->
        <div
          class="relative w-52 h-80 md:w-64 md:h-96 my-28 flex items-center justify-center"
        >
          <!-- Stack Effect Behind -->
          <div
            class="absolute top-4 scale-95 inset-x-0 h-full bg-card/40 rounded-3xl border border-white/5 z-0 origin-bottom transition-transform duration-700 animate-in slide-in-from-bottom-4"
          ></div>
          <div
            class="absolute top-2 scale-[0.98] inset-x-0 h-full bg-card/70 rounded-3xl border border-white/10 z-0 origin-bottom transition-transform duration-500 animate-in slide-in-from-bottom-2"
          ></div>

          <!-- Center Card (Mock UI) -->
          <div
            class="absolute inset-0 bg-card rounded-3xl border-2 border-border shadow-2xl flex flex-col items-center p-4 z-10 overflow-hidden"
          >
            <div
              class="w-full h-3/4 bg-muted/30 rounded-xl mb-4 relative overflow-hidden"
            >
              <!-- Mock Image Gradient -->
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10"
              ></div>
              <div
                class="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-background/50 backdrop-blur"
              ></div>
            </div>
            <div class="w-3/4 h-3 bg-muted/50 rounded-full mb-2"></div>
            <div class="w-1/2 h-3 bg-muted/30 rounded-full"></div>
          </div>

          <!-- Top: Wishlist -->
          <div
            class="absolute -top-20 md:-top-24 flex flex-col items-center gap-2 z-20"
          >
            <div class="flex flex-col items-center gap-1">
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20"
                >Wishlist</span
              >
              <div
                class="w-12 h-12 rounded-full bg-background border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                <Bookmark class="w-6 h-6 fill-current" />
              </div>
            </div>
            <ArrowUp class="w-8 h-8 text-blue-500 animate-swipe-up" />
          </div>

          <!-- Bottom: Later -->
          <div
            class="absolute -bottom-20 md:-bottom-24 flex flex-col-reverse items-center gap-2 z-20"
          >
            <div
              class="flex flex-col-reverse items-center gap-1"
              style="animation-delay: 0.2s"
            >
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20"
                >Plus tard</span
              >
              <div
                class="w-12 h-12 rounded-full bg-background border border-slate-500/30 flex items-center justify-center text-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.2)]"
              >
                <Clock class="w-6 h-6" />
              </div>
            </div>
            <ArrowDown class="w-8 h-8 text-slate-500 animate-swipe-down" />
          </div>

          <!-- Right: Like -->
          <div
            class="absolute -right-16 md:-right-24 flex flex-row-reverse items-center gap-2 z-20"
          >
            <div
              class="flex flex-col items-center gap-1"
              style="animation-delay: 0.1s"
            >
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20"
                >J'aime</span
              >
              <div
                class="w-14 h-14 rounded-full bg-background border border-green-500/30 flex items-center justify-center text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                <Heart class="w-7 h-7 fill-current" />
              </div>
            </div>
            <ArrowRight
              class="w-10 h-10 text-green-500 animate-swipe-right mt-5"
            />
          </div>

          <!-- Left: Dislike -->
          <div
            class="absolute -left-16 md:-left-24 flex flex-row items-center gap-2 z-20"
          >
            <div
              class="flex flex-col items-center gap-1"
              style="animation-delay: 0.3s"
            >
              <span
                class="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20"
                >Passer</span
              >
              <div
                class="w-14 h-14 rounded-full bg-background border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                <X class="w-7 h-7" />
              </div>
            </div>
            <ArrowLeft class="w-10 h-10 text-red-500 animate-swipe-left mt-5" />
          </div>
        </div>

        <div class="space-y-6 w-full">
          <p class="text-muted-foreground">
            Swipe dans la direction de ton choix pour trier tes recommandations.
          </p>

          <button
            @click="step = 4"
            class="px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all w-full"
          >
            Compris !
          </button>
        </div>
      </div>

      <!--Step 4: Success-->
      <div
        v-else-if="step === 4"
        class="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500"
      >
        <div
          class="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
        >
          <Check class="w-16 h-16 text-green-500" />
        </div>

        <div class="space-y-4">
          <h1 class="text-4xl font-black">C'est tout bon !</h1>
          <p class="text-muted-foreground text-lg">
            Ton profil est prêt. Découvre maintenant ta première sélection
            personnalisée.
          </p>
        </div>

        <button
          @click="finishOnboarding"
          class="px-8 py-4 bg-white text-black font-bold text-lg rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all w-full max-w-xs"
        >
          Lancer l'expérience
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes swipe-hint-up {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  50% {
    transform: translateY(-15px);
    opacity: 0.5;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes swipe-hint-down {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  50% {
    transform: translateY(15px);
    opacity: 0.5;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes swipe-hint-right {
  0% {
    transform: translateX(0);
    opacity: 1;
  }

  50% {
    transform: translateX(15px);
    opacity: 0.5;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes swipe-hint-left {
  0% {
    transform: translateX(0);
    opacity: 1;
  }

  50% {
    transform: translateX(-15px);
    opacity: 0.5;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-swipe-up {
  animation: swipe-hint-up 2s ease-in-out infinite;
}

.animate-swipe-down {
  animation: swipe-hint-down 2s ease-in-out infinite;
}

.animate-swipe-right {
  animation: swipe-hint-right 2s ease-in-out infinite;
}

.animate-swipe-left {
  animation: swipe-hint-left 2s ease-in-out infinite;
}
</style>
