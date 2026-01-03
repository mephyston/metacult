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

import { cn, getWebappUrl } from '../../lib/utils';
import { authClient } from '../../lib/auth-client';

interface User {
  name?: string;
  email?: string;
  avatar?: string;
}

interface Props {
  user?: User | null;
  context?: 'website' | 'app';
}

const props = withDefaults(defineProps<Props>(), {
  context: 'website',
});

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
      console.error('[Header] Failed to fetch session:', error);
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
    console.error('[Header] Logout failed:', error);
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
                <!-- Explorer Item -->
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Explorer</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul
                      class="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]"
                    >
                      <li class="row-span-3">
                        <NavigationMenuLink as-child>
                          <a
                            class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted to-muted/50 p-6 no-underline outline-none focus:shadow-md"
                            href="/trends"
                          >
                            <div class="mb-2 mt-4 text-3xl">🔥</div>
                            <div class="mb-2 text-lg font-medium">
                              Tendances
                            </div>
                            <p
                              class="text-sm leading-tight text-muted-foreground"
                            >
                              Découvrez les jeux, films et séries qui font le
                              buzz en ce moment (Top ELO).
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink as-child>
                          <a
                            href="/catalog?type=game"
                            class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div class="text-sm font-medium leading-none">
                              🎮 Jeux Vidéo
                            </div>
                            <p
                              class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                            >
                              Explorez notre collection de jeux culte.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink as-child>
                          <a
                            href="/catalog?type=movie"
                            class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div class="text-sm font-medium leading-none">
                              🎬 Films & Séries
                            </div>
                            <p
                              class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                            >
                              Les grands classiques du cinéma.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink as-child>
                          <a
                            href="/catalog?type=book"
                            class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div class="text-sm font-medium leading-none">
                              📚 Livres & BD
                            </div>
                            <p
                              class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                            >
                              Romans, mangas et comics.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <!-- Classements Item -->
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Classements</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul
                      class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
                    >
                      <li>
                        <NavigationMenuLink as-child>
                          <a
                            href="/rankings/hall-of-fame"
                            class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div class="text-sm font-medium leading-none">
                              🏆 Hall of Fame
                            </div>
                            <p
                              class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                            >
                              Le classement ultime par ELO.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink as-child>
                          <a
                            href="/rankings/hidden-gems"
                            class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div class="text-sm font-medium leading-none">
                              💎 Pépites Cachées
                            </div>
                            <p
                              class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                            >
                              D'excellentes notes mais peu de vues.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink as-child>
                          <a
                            href="/rankings/controversial"
                            class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div class="text-sm font-medium leading-none">
                              📉 Les Controversés
                            </div>
                            <p
                              class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                            >
                              Ils divisent la communauté.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <!-- À Propos Item -->
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/about"
                    :class="navigationMenuTriggerStyle()"
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
              class="hidden md:flex"
            >
              Ouvrir l'App
            </Button>

            <!-- APP CONTEXT: Show User Menu (Logout) -->
            <!-- Or Website context: Show User Menu as well for consistency but maybe simpler? -->
            <!-- Requirement says: "Website: Affiche Logo et NavigationMenu". "App: Affiche logo et deconnexion". -->
            <!-- I will keep User Menu for both for consistency, but prioritize 'Open App' on Website -->

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="relative flex h-9 w-9 shrink-0 items-center justify-center !rounded-full overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors !p-[2px]"
                >
                  <div
                    class="h-full w-full flex items-center justify-center bg-primary text-primary-foreground !rounded-full overflow-hidden"
                  >
                    <span
                      v-if="!currentUser.avatar"
                      class="text-sm font-semibold"
                    >
                      {{ userInitials }}
                    </span>
                    <img
                      v-else
                      :src="currentUser.avatar"
                      :alt="currentUser.name || 'User avatar'"
                      class="h-full w-full object-cover !rounded-full"
                    />
                  </div>
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
                  <a :href="appUrl" class="cursor-pointer w-full font-medium"
                    >Ouvrir l'App</a
                  >
                </DropdownMenuItem>

                <DropdownMenuItem
                  class="cursor-pointer text-destructive focus:text-destructive"
                  @click="handleLogout"
                >
                  Déconnexion
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
              <Button variant="ghost" size="sm" as="a" :href="loginUrl">
                Connexion
              </Button>
              <Button variant="default" size="sm" as="a" :href="registerUrl">
                Inscription
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
