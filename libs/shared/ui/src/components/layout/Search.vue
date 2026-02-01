<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useMagicKeys, useDebounceFn } from '@vueuse/core';
import {
  Search as SearchIcon,
  CloudDownload,
  Loader2,
  Gamepad2,
  Film,
  Tv,
  BookOpen,
  Database,
} from 'lucide-vue-next';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '../ui/command';
import { Button } from '../ui/button';
import { getApiUrl, getWebsiteUrl } from '../../lib/utils';
import { logger } from '../../lib/logger';

// Types (simplified version of DTO)
interface SearchResultItem {
  id: string;
  externalId: string | null;
  slug?: string; // Added slug
  title: string;
  year: number | null;
  poster: string | null;
  type: 'game' | 'movie' | 'tv' | 'book';
  isImported: boolean;
}

interface GroupedSearchResponse {
  games: SearchResultItem[];
  movies: SearchResultItem[];
  shows: SearchResultItem[];
  books: SearchResultItem[];
}

const open = ref(false);
const query = ref('');
const isLoading = ref(false);
const results = ref<GroupedSearchResponse>({
  games: [],
  movies: [],
  shows: [],
  books: [],
});
const importingId = ref<string | null>(null);
const commandListRef = ref<any>(null);

const hasResults = computed(() => {
  return (
    results.value.games.length > 0 ||
    results.value.movies.length > 0 ||
    results.value.shows.length > 0 ||
    results.value.books.length > 0
  );
});

// Reset scroll on query change
watch(query, () => {
  if (commandListRef.value?.$el) {
    commandListRef.value.$el.scrollTop = 0;
  }
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    open.value = !open.value;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function handleOpen() {
  open.value = true;
}

const searchApi = async (q: string) => {
  if (q.length < 3) {
    results.value = { games: [], movies: [], shows: [], books: [] };
    return;
  }

  isLoading.value = true;
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(
      `${baseUrl}/api/media/search?q=${encodeURIComponent(q)}`,
    );
    if (res.ok) {
      results.value = await res.json();
    }
  } catch (e) {
    logger.error('[Search] Search failed:', e);
  } finally {
    isLoading.value = false;
  }
};

const debouncedSearch = useDebounceFn(searchApi, 500);

watch(query, (newVal) => {
  debouncedSearch(newVal);
});

async function handleSelect(item: SearchResultItem) {
  if (item.isImported) {
    // Navigate to slug if available, else ID
    navigateToMedia(item.type, item.slug || item.id);
  } else {
    // Import logic
    logger.debug('[Search] Importing item:', item);
    importingId.value = item.id;
    const baseUrl = getApiUrl();
    try {
      const res = await fetch(`${baseUrl}/api/media/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: item.externalId || item.id, // Use External Provider ID for import
          type: item.type,
        }),
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.id) {
          // Prefer slug if returned
          navigateToMedia(item.type, body.slug || body.id);
        } else {
          // Fallback
          window.location.reload();
        }
      } else if (res.status === 409) {
        // Media already imported - navigate to existing media
        logger.info('[Search] Media already exists, navigating to it...');
        const errorBody = await res.json().catch(() => ({}));
        const targetId = errorBody.existingId || item.slug || item.id;
        navigateToMedia(item.type, targetId);
      } else {
        logger.error('[Search] Import failed with status:', res.status);
        const error = await res
          .json()
          .catch(() => ({ message: 'Unknown error' }));
        logger.error('[Search] Error details:', error);
      }
    } catch (e) {
      logger.error('[Search] Import failed:', e);
    } finally {
      importingId.value = null;
    }
  }
}

function navigateToMedia(type: string, idOrSlug: string) {
  open.value = false;
  const websiteUrl = getWebsiteUrl();
  window.location.href = `${websiteUrl}/catalog/${type.toLowerCase()}/${idOrSlug}`;
}
</script>

<template>
  <div>
    <Button
      variant="outline"
      class="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
      @click="handleOpen"
    >
      <SearchIcon class="h-4 w-4 xl:mr-2" />
      <span class="hidden xl:inline-flex">Rechercher...</span>
      <span class="sr-only">Rechercher</span>
      <div
        class="pointer-events-none absolute right-1.5 top-2 hidden select-none items-center gap-1 xl:flex"
      >
        <kbd
          class="inline-flex h-6 w-6 items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
        >
          <span class="text-xs">⌘</span>
        </kbd>
        <kbd
          class="inline-flex h-6 w-6 items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
        >
          K
        </kbd>
      </div>
    </Button>

    <CommandDialog
      :open="open"
      :filter-function="(val: any[]) => val"
      @update:open="open = $event"
    >
      <CommandInput
        placeholder="Rechercher des films, jeux, livres..."
        :model-value="query"
        @input="
          (e: Event) => (query = (e.currentTarget as HTMLInputElement).value)
        "
      />

      <CommandList
        ref="commandListRef"
        class="max-h-[300px] overflow-y-auto overflow-x-hidden p-2"
      >
        <div
          v-if="query.length < 3"
          class="py-6 text-center text-sm text-muted-foreground"
        >
          Tapez une commande ou recherchez...
        </div>
        <CommandEmpty
          v-if="!isLoading && query.length >= 3 && !hasResults"
          class="py-6 text-center text-sm"
        >
          Aucun résultat trouvé.
        </CommandEmpty>
        <CommandEmpty v-if="isLoading" class="py-6 flex justify-center">
          <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
        </CommandEmpty>

        <!-- Games -->
        <CommandGroup v-if="results.games.length > 0" heading="Jeux Vidéo">
          <CommandItem
            v-for="item in results.games"
            :key="item.id"
            :value="item.title"
            class="aria-selected:bg-accent aria-selected:text-accent-foreground"
            @select="handleSelect(item)"
          >
            <Gamepad2 class="mr-2 h-4 w-4" />
            <span>{{ item.title }}</span>
            <span v-if="item.year" class="ml-2 text-muted-foreground text-xs"
              >({{ item.year }})</span
            >
            <div class="ml-auto flex items-center">
              <Loader2
                v-if="importingId === item.id"
                class="h-4 w-4 animate-spin"
              />
              <Database
                v-else-if="item.isImported"
                class="h-4 w-4 text-primary"
              />
              <CloudDownload
                v-else
                class="h-4 w-4 text-muted-foreground opacity-70"
              />
            </div>
          </CommandItem>
        </CommandGroup>

        <!-- Movies -->
        <CommandGroup v-if="results.movies.length > 0" heading="Films">
          <CommandItem
            v-for="item in results.movies"
            :key="item.id"
            :value="item.title"
            class="aria-selected:bg-accent aria-selected:text-accent-foreground"
            @select="handleSelect(item)"
          >
            <Film class="mr-2 h-4 w-4" />
            <span>{{ item.title }}</span>
            <span v-if="item.year" class="ml-2 text-muted-foreground text-xs"
              >({{ item.year }})</span
            >
            <div class="ml-auto flex items-center">
              <Loader2
                v-if="importingId === item.id"
                class="h-4 w-4 animate-spin"
              />
              <Database
                v-else-if="item.isImported"
                class="h-4 w-4 text-primary"
              />
              <CloudDownload
                v-else
                class="h-4 w-4 text-muted-foreground opacity-70"
              />
            </div>
          </CommandItem>
        </CommandGroup>

        <!-- Shows -->
        <CommandGroup v-if="results.shows.length > 0" heading="Séries TV">
          <CommandItem
            v-for="item in results.shows"
            :key="item.id"
            :value="item.title"
            class="aria-selected:bg-accent aria-selected:text-accent-foreground"
            @select="handleSelect(item)"
          >
            <Tv class="mr-2 h-4 w-4" />
            <span>{{ item.title }}</span>
            <span v-if="item.year" class="ml-2 text-muted-foreground text-xs"
              >({{ item.year }})</span
            >
            <div class="ml-auto flex items-center">
              <Loader2
                v-if="importingId === item.id"
                class="h-4 w-4 animate-spin"
              />
              <Database
                v-else-if="item.isImported"
                class="h-4 w-4 text-primary"
              />
              <CloudDownload
                v-else
                class="h-4 w-4 text-muted-foreground opacity-70"
              />
            </div>
          </CommandItem>
        </CommandGroup>

        <!-- Books -->
        <CommandGroup v-if="results.books.length > 0" heading="Livres">
          <CommandItem
            v-for="item in results.books"
            :key="item.id"
            :value="item.title"
            class="aria-selected:bg-accent aria-selected:text-accent-foreground"
            @select="handleSelect(item)"
          >
            <BookOpen class="mr-2 h-4 w-4" />
            <span>{{ item.title }}</span>
            <span v-if="item.year" class="ml-2 text-muted-foreground text-xs"
              >({{ item.year }})</span
            >
            <div class="ml-auto flex items-center">
              <Loader2
                v-if="importingId === item.id"
                class="h-4 w-4 animate-spin"
              />
              <Database
                v-else-if="item.isImported"
                class="h-4 w-4 text-primary"
              />
              <CloudDownload
                v-else
                class="h-4 w-4 text-muted-foreground opacity-70"
              />
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <div
        class="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-end gap-x-4 bg-muted/40 h-10"
      >
        <div class="flex items-center gap-1">
          <span class="text-xs">Aller à</span>
          <kbd
            class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
          >
            <span class="text-xs">⏎</span>
          </kbd>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs">Naviguer</span>
          <kbd
            class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
          >
            <span class="text-xs">↑↓</span>
          </kbd>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs">Fermer</span>
          <kbd
            class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
          >
            <span class="text-xs">Esc</span>
          </kbd>
        </div>
      </div>
    </CommandDialog>
  </div>
</template>
