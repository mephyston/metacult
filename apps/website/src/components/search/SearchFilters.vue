<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Input,
  Button,
  Select,
  SelectItem,
  Slider,
  Label,
} from '@metacult/shared-ui';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-vue-next';

/**
 * SearchFilters Component
 *
 * Uses shadcn-vue atomic components from @metacult/shared-ui.
 * Native GET form for SSR-friendly search navigation.
 */

// Props for pre-filling from URL
interface Props {
  initialQuery?: string;
  initialType?: string;
  initialYear?: number | string;
  initialMinElo?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialQuery: '',
  initialType: '',
  initialYear: '',
  initialMinElo: 800,
});

// Form state
const query = ref(props.initialQuery);
const type = ref(props.initialType);
const year = ref(props.initialYear?.toString() ?? '');
const minElo = ref([props.initialMinElo]);

// Mobile drawer state
const isDrawerOpen = ref(false);

// Media types available
const mediaTypes = [
  { value: '', label: 'Tous les types' },
  { value: 'game', label: 'Jeux Vidéo' },
  { value: 'movie', label: 'Films' },
  { value: 'tv', label: 'Séries' },
  { value: 'book', label: 'Livres' },
];

// Year options (dynamic range)
const currentYear = new Date().getFullYear();
const yearOptions = computed(() => {
  const years = [{ value: '', label: 'Toutes les années' }];
  for (let y = currentYear; y >= 1990; y--) {
    years.push({ value: y.toString(), label: y.toString() });
  }
  return years;
});

// ELO quality labels
const eloLabel = computed(() => {
  const elo = minElo.value[0];
  if (elo >= 1800) return 'Excellent';
  if (elo >= 1500) return 'Très bon';
  if (elo >= 1200) return 'Bon';
  if (elo >= 1000) return 'Correct';
  return 'Tous';
});

// Clear all filters
function clearFilters() {
  query.value = '';
  type.value = '';
  year.value = '';
  minElo.value = [800];
}

// Toggle mobile drawer
function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value;
}

// Handle form submit
function handleSubmit() {
  const params = new URLSearchParams();
  if (query.value) params.set('q', query.value);
  if (type.value) params.set('type', type.value);
  if (year.value) params.set('releaseYear', year.value);
  if (minElo.value[0] > 800) params.set('minElo', minElo.value[0].toString());

  window.location.href = `/search?${params.toString()}`;
}
</script>

<template>
  <!-- Mobile Filter Toggle -->
  <Button
    variant="default"
    class="md:hidden fixed bottom-4 right-4 z-40 rounded-full shadow-lg"
    @click="toggleDrawer"
  >
    <SlidersHorizontal class="h-5 w-5 mr-2" />
    Filtres
  </Button>

  <!-- Mobile Drawer Overlay -->
  <div
    v-if="isDrawerOpen"
    class="md:hidden fixed inset-0 z-40 bg-black/50"
    @click="toggleDrawer"
  />

  <!-- Filter Form (Sidebar on Desktop, Drawer on Mobile) -->
  <form
    @submit.prevent="handleSubmit"
    :class="[
      'bg-card border rounded-lg p-4 space-y-6',
      // Mobile: drawer from bottom
      'md:relative md:block',
      isDrawerOpen
        ? 'fixed inset-x-0 bottom-0 z-50 rounded-t-2xl rounded-b-none animate-slide-up'
        : 'hidden md:block',
    ]"
  >
    <!-- Drawer Header (Mobile) -->
    <div class="md:hidden flex items-center justify-between pb-2 border-b">
      <h3 class="font-semibold">Filtres</h3>
      <Button variant="ghost" size="icon" @click="toggleDrawer">
        <X class="h-5 w-5" />
      </Button>
    </div>

    <!-- Search Input -->
    <div class="space-y-2">
      <Label for="search-query">Mots-clés</Label>
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          id="search-query"
          v-model="query"
          placeholder="Rechercher..."
          class="pl-10"
        />
      </div>
    </div>

    <!-- Type Select -->
    <div class="space-y-2">
      <Label for="type-select">Type de média</Label>
      <Select v-model="type" placeholder="Tous les types">
        <SelectItem
          v-for="opt in mediaTypes"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </SelectItem>
      </Select>
    </div>

    <!-- Year Select -->
    <div class="space-y-2">
      <Label for="year-select">Année de sortie</Label>
      <Select v-model="year" placeholder="Toutes les années">
        <SelectItem
          v-for="opt in yearOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </SelectItem>
      </Select>
    </div>

    <!-- ELO Slider -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <Label>Qualité minimum</Label>
        <span class="text-sm text-muted-foreground"
          >{{ eloLabel }} ({{ minElo[0] }})</span
        >
      </div>
      <Slider v-model="minElo" :min="800" :max="2000" :step="50" />
      <div class="flex justify-between text-xs text-muted-foreground">
        <span>800</span>
        <span>2000</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-2">
      <Button type="submit" class="flex-1">
        <Search class="h-4 w-4 mr-2" />
        Rechercher
      </Button>
      <Button type="button" variant="outline" @click="clearFilters">
        <RotateCcw class="h-4 w-4 mr-2" />
        Effacer
      </Button>
    </div>
  </form>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
