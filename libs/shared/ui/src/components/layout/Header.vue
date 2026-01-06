<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '../ui/navigation-menu';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import { cn, getWebappUrl } from '../../lib/utils';
import { authClient } from '../../lib/auth-client';
import { logger } from '../../lib/logger';

interface User {
  name?: string;
  email?: string;
  avatar?: string;
}

interface HeaderLabels {
  explorer: string;
  login: string;
  register: string;
  logout: string;
  openApp: string;
  profile: string;
  settings: string;
}

interface TrendingMedia {
  id: string;
  title: string;
  slug: string;
  type: string;
  coverUrl?: { value: string } | string | null;
}

interface TrendingHighlights {
  movie?: TrendingMedia | null;
  tv?: TrendingMedia | null;
  game?: TrendingMedia | null;
  book?: TrendingMedia | null;
}

interface Props {
  user?: User | null;
  context?: 'website' | 'app';
  labels: HeaderLabels;
  trendingHighlights?: TrendingHighlights;
}

const props = withDefaults(defineProps<Props>(), {
  context: 'website',
});

// Smart Year logic (before March = N-1, after = N)
const currentCatalogYear = (() => {
  const now = new Date();
  return now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
})();

// Helper to extract cover URL from Value Object or string
const getCoverUrl = (
  media: TrendingMedia | null | undefined,
): string | undefined => {
  if (!media?.coverUrl) return undefined;
  if (typeof media.coverUrl === 'string') return media.coverUrl;
  if (typeof media.coverUrl === 'object' && 'value' in media.coverUrl)
    return media.coverUrl.value;
  return undefined;
};

const emit = defineEmits<{
  logout: [];
}>();

const isOpen = ref(false);
const sessionUser = ref<User | null>(null);
const isLoadingSession = ref(true);

const currentUser = computed(() => props.user ?? sessionUser.value);
const isMounted = ref(false);

onMounted(async () => {
  isMounted.value = true;
  if (props.user === undefined) {
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        sessionUser.value = {
          name: data.user.name ?? undefined,
          email: data.user.email ?? undefined,
          avatar: data.user.image ?? undefined,
        };
      }
    } catch (error) {
      logger.error('[Header] Failed to fetch session:', error);
    } finally {
      isLoadingSession.value = false;
    }
  } else {
    isLoadingSession.value = false;
  }
});

const webappUrl = getWebappUrl();
const loginUrl = `${webappUrl}/login`;
const registerUrl = `${webappUrl}/register`;
const appUrl = `${webappUrl}/`;

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const userInitials = computed(() => {
  const user = currentUser.value;
  if (!user?.name) return 'U';
  const names = user.name.split(' ');
  if (names.length >= 2) {
    return `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`.toUpperCase();
  }
  return user.name.substring(0, 2).toUpperCase();
});

const handleLogout = async () => {
  try {
    await authClient.signOut();
  } catch (error) {
    logger.error('[Header] Logout failed:', error);
  } finally {
    sessionUser.value = null;
    emit('logout');
  }
};
</script>

<template>
  <header
    id="header"
    class="bg-background/80 backdrop-blur-md relative z-50 h-20 border-b border-border"
  >
    <div class="w-full px-6 h-full">
      <div class="navbar h-full flex items-center justify-between">
        <!-- Navbar Left: Logo & Nav -->
        <div class="navbar-left flex items-center h-full gap-8">
          <!-- Logo -->
          <a href="/" class="logo flex items-center h-full">
            <span
              class="text-2xl font-display font-bold text-foreground uppercase tracking-wider"
              >Metacult</span
            >
          </a>

          <!-- Navigation (Website Only) -->
          <div v-if="context === 'website'" class="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <!-- Films Menu -->
                <NavigationMenuItem>
                  <NavigationMenuTrigger class="uppercase"
                    >Films</NavigationMenuTrigger
                  >
                  <NavigationMenuContent>
                    <div class="grid gap-3 p-6 w-[500px] grid-cols-[250px_1fr]">
                      <!-- Featured Trending -->
                      <NavigationMenuLink as-child>
                        <a
                          :href="
                            trendingHighlights?.movie
                              ? `/catalog/movie/${trendingHighlights.movie.slug}`
                              : '/catalog/movie/trending'
                          "
                          class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted to-muted/50 p-4 no-underline outline-none focus:shadow-md overflow-hidden relative"
                        >
                          <img
                            v-if="getCoverUrl(trendingHighlights?.movie)"
                            :src="getCoverUrl(trendingHighlights?.movie)"
                            :alt="trendingHighlights?.movie?.title"
                            class="absolute inset-0 w-full h-full object-cover opacity-30"
                          />
                          <div class="relative z-10">
                            <div
                              class="mb-1 text-xs font-medium text-primary uppercase"
                            >
                              🔥 En Tendance
                            </div>
                            <div
                              class="mb-1 text-base font-semibold line-clamp-2"
                            >
                              {{
                                trendingHighlights?.movie?.title || 'Découvrir'
                              }}
                            </div>
                            <p class="text-xs text-muted-foreground">
                              Le n°1 du moment
                            </p>
                          </div>
                        </a>
                      </NavigationMenuLink>
                      <!-- Links -->
                      <ul class="flex flex-col gap-2">
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/catalog/movie/upcoming"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >📅 Bientôt</a
                            ></NavigationMenuLink
                          >
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              :href="`/catalog/movie/best-of`"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >🏆 Le Top {{ currentCatalogYear }}</a
                            >
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/catalog/movie/hall-of-fame"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >⭐ Hall of Fame</a
                            ></NavigationMenuLink
                          >
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/search?type=movie"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >🔍 Recherche avancée</a
                            >
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <!-- Séries Menu -->
                <NavigationMenuItem>
                  <NavigationMenuTrigger class="uppercase"
                    >Séries</NavigationMenuTrigger
                  >
                  <NavigationMenuContent>
                    <div class="grid gap-3 p-6 w-[500px] grid-cols-[250px_1fr]">
                      <NavigationMenuLink as-child>
                        <a
                          :href="
                            trendingHighlights?.tv
                              ? `/catalog/tv/${trendingHighlights.tv.slug}`
                              : '/catalog/tv/trending'
                          "
                          class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted to-muted/50 p-4 no-underline outline-none focus:shadow-md overflow-hidden relative"
                        >
                          <img
                            v-if="getCoverUrl(trendingHighlights?.tv)"
                            :src="getCoverUrl(trendingHighlights?.tv)"
                            :alt="trendingHighlights?.tv?.title"
                            class="absolute inset-0 w-full h-full object-cover opacity-30"
                          />
                          <div class="relative z-10">
                            <div
                              class="mb-1 text-xs font-medium text-primary uppercase"
                            >
                              🔥 En Tendance
                            </div>
                            <div
                              class="mb-1 text-base font-semibold line-clamp-2"
                            >
                              {{ trendingHighlights?.tv?.title || 'Découvrir' }}
                            </div>
                            <p class="text-xs text-muted-foreground">
                              Le n°1 du moment
                            </p>
                          </div>
                        </a>
                      </NavigationMenuLink>
                      <ul class="flex flex-col gap-2">
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/catalog/tv/upcoming"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >📅 Bientôt</a
                            ></NavigationMenuLink
                          >
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              :href="`/catalog/tv/best-of`"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >🏆 Le Top {{ currentCatalogYear }}</a
                            >
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/catalog/tv/hall-of-fame"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >⭐ Hall of Fame</a
                            ></NavigationMenuLink
                          >
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/search?type=tv"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >🔍 Recherche avancée</a
                            >
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <!-- Jeux Menu -->
                <NavigationMenuItem>
                  <NavigationMenuTrigger class="uppercase"
                    >Jeux</NavigationMenuTrigger
                  >
                  <NavigationMenuContent>
                    <div class="grid gap-3 p-6 w-[500px] grid-cols-[250px_1fr]">
                      <NavigationMenuLink as-child>
                        <a
                          :href="
                            trendingHighlights?.game
                              ? `/catalog/game/${trendingHighlights.game.slug}`
                              : '/catalog/game/trending'
                          "
                          class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted to-muted/50 p-4 no-underline outline-none focus:shadow-md overflow-hidden relative"
                        >
                          <img
                            v-if="getCoverUrl(trendingHighlights?.game)"
                            :src="getCoverUrl(trendingHighlights?.game)"
                            :alt="trendingHighlights?.game?.title"
                            class="absolute inset-0 w-full h-full object-cover opacity-30"
                          />
                          <div class="relative z-10">
                            <div
                              class="mb-1 text-xs font-medium text-primary uppercase"
                            >
                              🔥 En Tendance
                            </div>
                            <div
                              class="mb-1 text-base font-semibold line-clamp-2"
                            >
                              {{
                                trendingHighlights?.game?.title || 'Découvrir'
                              }}
                            </div>
                            <p class="text-xs text-muted-foreground">
                              Le n°1 du moment
                            </p>
                          </div>
                        </a>
                      </NavigationMenuLink>
                      <ul class="flex flex-col gap-2">
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/catalog/game/upcoming"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >📅 Bientôt</a
                            ></NavigationMenuLink
                          >
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              :href="`/catalog/game/best-of`"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >🏆 Le Top {{ currentCatalogYear }}</a
                            >
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/catalog/game/hall-of-fame"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >⭐ Hall of Fame</a
                            ></NavigationMenuLink
                          >
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/search?type=game"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >🔍 Recherche avancée</a
                            >
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <!-- Livres Menu -->
                <NavigationMenuItem>
                  <NavigationMenuTrigger class="uppercase"
                    >Livres</NavigationMenuTrigger
                  >
                  <NavigationMenuContent>
                    <div class="grid gap-3 p-6 w-[500px] grid-cols-[250px_1fr]">
                      <NavigationMenuLink as-child>
                        <a
                          :href="
                            trendingHighlights?.book
                              ? `/catalog/book/${trendingHighlights.book.slug}`
                              : '/catalog/book/trending'
                          "
                          class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted to-muted/50 p-4 no-underline outline-none focus:shadow-md overflow-hidden relative"
                        >
                          <img
                            v-if="getCoverUrl(trendingHighlights?.book)"
                            :src="getCoverUrl(trendingHighlights?.book)"
                            :alt="trendingHighlights?.book?.title"
                            class="absolute inset-0 w-full h-full object-cover opacity-30"
                          />
                          <div class="relative z-10">
                            <div
                              class="mb-1 text-xs font-medium text-primary uppercase"
                            >
                              🔥 En Tendance
                            </div>
                            <div
                              class="mb-1 text-base font-semibold line-clamp-2"
                            >
                              {{
                                trendingHighlights?.book?.title || 'Découvrir'
                              }}
                            </div>
                            <p class="text-xs text-muted-foreground">
                              Le n°1 du moment
                            </p>
                          </div>
                        </a>
                      </NavigationMenuLink>
                      <ul class="flex flex-col gap-2">
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/catalog/book/upcoming"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >📅 Bientôt</a
                            ></NavigationMenuLink
                          >
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              :href="`/catalog/book/best-of`"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >🏆 Le Top {{ currentCatalogYear }}</a
                            >
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/catalog/book/hall-of-fame"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >⭐ Hall of Fame</a
                            ></NavigationMenuLink
                          >
                        </li>
                        <li>
                          <NavigationMenuLink as-child
                            ><a
                              href="/search?type=book"
                              class="block p-2 rounded hover:bg-accent text-sm"
                              >🔍 Recherche avancée</a
                            >
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <!-- À Propos Item -->
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/about"
                    :class="cn(navigationMenuTriggerStyle(), 'uppercase')"
                  >
                    À Propos
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <!-- Right Side Container (aligned to right) -->
        <div class="flex items-center ml-auto gap-4">
          <!-- Search Slot -->
          <div class="hidden md:block mr-2">
            <slot name="search" />
          </div>

          <!-- Actions Slot -->
          <slot name="actions" />

          <!-- AUTHENTICATED USER -->
          <div v-if="isMounted && currentUser" class="flex items-center gap-2">
            <!-- WEBSITE CONTEXT: Show 'Open App' Button -->
            <Button
              v-if="context === 'website'"
              variant="default"
              as="a"
              :href="appUrl"
              class="hidden md:flex uppercase"
            >
              {{ labels.openApp }}
            </Button>

            <!-- APP CONTEXT: Show User Menu (Logout) -->
            <!-- Or Website context: Show User Menu as well for consistency but maybe simpler? -->
            <!-- Requirement says: "Website: Affiche Logo et NavigationMenu". "App: Affiche logo et deconnexion". -->
            <!-- I will keep User Menu for both for consistency, but prioritize 'Open App' on Website -->

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="appearance-none focus:outline-none border-none bg-transparent cursor-pointer rounded-full"
                >
                  <Avatar
                    class="h-9 w-9 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <AvatarImage
                      v-if="currentUser?.avatar"
                      :src="currentUser.avatar"
                      :alt="currentUser.name || 'User avatar'"
                    />
                    <AvatarFallback>{{ userInitials }}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-56">
                <!-- User Info -->
                <div class="flex items-center justify-start gap-2 p-2">
                  <div class="flex flex-col space-y-1 leading-none">
                    <p v-if="currentUser.name" class="font-medium">
                      {{ currentUser.name }}
                    </p>
                    <p
                      v-if="currentUser.email"
                      class="text-sm text-muted-foreground"
                    >
                      {{ currentUser.email }}
                    </p>
                  </div>
                </div>
                <hr class="my-1 border-border" />

                <DropdownMenuItem v-if="context === 'website'" as-child>
                  <a :href="appUrl" class="cursor-pointer w-full font-medium">{{
                    labels.openApp
                  }}</a>
                </DropdownMenuItem>

                <DropdownMenuItem
                  class="cursor-pointer text-destructive focus:text-destructive"
                  @click="handleLogout"
                >
                  {{ labels.logout }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- GUEST USER -->
          <div
            v-else-if="isMounted && !isLoadingSession"
            class="hidden md:flex items-center gap-2"
          >
            <!-- Website Context: Login/Register -->
            <template v-if="context === 'website'">
              <Button
                variant="ghost"
                size="sm"
                as="a"
                :href="loginUrl"
                class="uppercase"
              >
                {{ labels.login }}
              </Button>
              <Button
                variant="default"
                size="sm"
                as="a"
                :href="registerUrl"
                class="uppercase"
              >
                {{ labels.register }}
              </Button>
            </template>
          </div>

          <!-- Unified Theme Control -->
          <ThemeToggle
            class="text-foreground hover:bg-accent hover:text-accent-foreground"
          />

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden text-gray-400 hover:text-white ml-2"
            @click="toggleMenu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Nav (simplified for now, logic roughly same) -->
    <div
      v-show="isOpen"
      class="md:hidden border-t border-border bg-background absolute w-full left-0 top-20 shadow-xl z-50"
    >
      <nav class="flex flex-col p-4 gap-4">
        <!-- Replicate Website links for Mobile -->
        <div v-if="context === 'website'" class="flex flex-col gap-2">
          <h4 class="font-bold text-muted-foreground uppercase text-xs">
            Explorer
          </h4>
          <a href="/trends" class="text-foreground py-2">🔥 Tendances</a>
          <a href="/catalog?type=game" class="text-foreground py-2"
            >🎮 Jeux Vidéo</a
          >
          <a href="/catalog?type=movie" class="text-foreground py-2"
            >🎬 Films & Séries</a
          >
          <a href="/catalog?type=book" class="text-foreground py-2"
            >📚 Livres & BD</a
          >

          <h4 class="font-bold text-muted-foreground uppercase text-xs mt-4">
            Classements
          </h4>
          <a href="/rankings/hall-of-fame" class="text-foreground py-2"
            >🏆 Hall of Fame</a
          >
          <a href="/rankings/hidden-gems" class="text-foreground py-2"
            >💎 Pépites Cachées</a
          >

          <a href="/about" class="text-foreground py-2 font-medium mt-2"
            >À Propos</a
          >
        </div>

        <slot name="mobile-nav" />

        <!-- Auth buttons in mobile menu -->
        <div
          v-if="!currentUser && !isLoadingSession && context === 'website'"
          class="flex flex-col gap-2 pt-2 border-t border-border"
        >
          <Button
            variant="ghost"
            size="sm"
            as="a"
            :href="loginUrl"
            class="w-full justify-center"
          >
            Connexion
          </Button>
          <Button
            variant="default"
            size="sm"
            as="a"
            :href="registerUrl"
            class="w-full justify-center"
          >
            Inscription
          </Button>
        </div>

        <div
          v-if="currentUser"
          class="flex flex-col gap-2 pt-2 border-t border-border"
        >
          <Button
            v-if="context === 'website'"
            variant="default"
            size="sm"
            as="a"
            :href="appUrl"
            class="w-full justify-center"
          >
            Ouvrir l'App
          </Button>
          <Button
            variant="destructive"
            size="sm"
            class="w-full justify-center"
            @click="handleLogout"
          >
            Déconnexion
          </Button>
        </div>
      </nav>
    </div>
  </header>
</template>

<style lang="postcss"></style>
