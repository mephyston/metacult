<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import Navigation from './Navigation.vue';
import { cn } from '../../lib/utils';
import { authClient } from '../../lib/auth-client';

interface User {
    name?: string;
    email?: string;
    avatar?: string;
}

interface Props {
    user?: User | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    logout: [];
}>();

const isOpen = ref(false);
const sessionUser = ref<User | null>(null);
const isLoadingSession = ref(true);

// User actuel : priorité à la prop, sinon session locale
const currentUser = computed(() => props.user ?? sessionUser.value);

// Fetch session au montage
onMounted(async () => {
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

// URLs pour l'authentification (webapp Nuxt)
const webappUrl = import.meta.env.PUBLIC_WEBAPP_URL || 'http://localhost:4201';
const loginUrl = `${webappUrl}/login`;
const registerUrl = `${webappUrl}/register`;

const toggleMenu = () => {
    isOpen.value = !isOpen.value;
};

// Compute user initials for avatar fallback
const userInitials = computed(() => {
    const user = currentUser.value;
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
});

const handleLogout = async () => {
    try {
        await authClient.signOut();
        emit('logout');
    } catch (error) {
        console.error('[Header] Logout failed:', error);
    }
};
</script>

<template>
    <header id="header" class="bg-background/80 backdrop-blur-md relative z-50 h-20 border-b border-border">
        <div class="w-full px-6 h-full">
            <div class="navbar h-full flex items-center justify-between">

                <!-- Navbar Left: Logo & Nav -->
                <div class="navbar-left flex items-center h-full gap-8">
                    <!-- Logo -->
                    <a href="/" class="logo flex items-center h-full">
                        <span
                            class="text-2xl font-display font-bold text-foreground uppercase tracking-wider">Metacult</span>
                    </a>

                    <div class="hidden md:flex">
                        <slot name="nav">
                            <Navigation />
                        </slot>
                    </div>
                </div>

                <!-- Right Side Container (aligned to right) -->
                <div class="flex items-center ml-auto gap-4">

                    <!-- Search Slot -->
                    <div class="hidden md:block mr-2">
                        <slot name="search" />
                    </div>

                    <!-- Actions -->
                    <slot name="actions" />

                    <!-- User Menu (if authenticated) -->
                    <div v-if="currentUser" class="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger as-child>
                                <button
                                    class="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                    <span v-if="!currentUser.avatar" class="text-sm font-semibold">
                                        {{ userInitials }}
                                    </span>
                                    <img v-else :src="currentUser.avatar" :alt="currentUser.name || 'User avatar'"
                                        class="h-full w-full rounded-full object-cover" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" class="w-56">
                                <div class="flex items-center justify-start gap-2 p-2">
                                    <div class="flex flex-col space-y-1 leading-none">
                                        <p v-if="currentUser.name" class="font-medium">{{ currentUser.name }}</p>
                                        <p v-if="currentUser.email" class="text-sm text-muted-foreground">{{ currentUser.email }}</p>
                                    </div>
                                </div>
                                <hr class="my-1 border-border" />
                                <DropdownMenuItem @click="handleLogout" class="cursor-pointer text-destructive focus:text-destructive">
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <!-- Auth Buttons (if not authenticated) - Hidden on mobile -->
                    <div v-else-if="!isLoadingSession" class="hidden md:flex items-center gap-2">
                        <Button variant="ghost" size="sm" as="a" :href="loginUrl">
                            Connexion
                        </Button>
                        <Button variant="default" size="sm" as="a" :href="registerUrl">
                            Inscription
                        </Button>
                    </div>

                    <!-- Unified Theme Control (Toggle + Hover Switcher) -->
                    <ThemeToggle class="text-foreground hover:bg-accent hover:text-accent-foreground" />

                    <!-- Mobile Menu Button -->
                    <button @click="toggleMenu" class="md:hidden text-gray-400 hover:text-white ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Nav -->
        <div v-show="isOpen"
            class="md:hidden border-t border-border bg-background absolute w-full left-0 top-20 shadow-xl z-50">
            <nav class="flex flex-col p-4 gap-4">
                <slot name="mobile-nav" />
                
                <!-- Auth buttons in mobile menu (if not authenticated) -->
                <div v-if="!currentUser && !isLoadingSession" class="flex flex-col gap-2 pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" as="a" :href="loginUrl" class="w-full justify-center">
                        Connexion
                    </Button>
                    <Button variant="default" size="sm" as="a" :href="registerUrl" class="w-full justify-center">
                        Inscription
                    </Button>
                </div>

                <!-- User info in mobile menu (if authenticated) -->
                <div v-if="currentUser" class="flex flex-col gap-2 pt-2 border-t border-border">
                    <div class="flex items-center gap-3 p-2">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span v-if="!currentUser.avatar" class="text-sm font-semibold">
                                {{ userInitials }}
                            </span>
                            <img v-else :src="currentUser.avatar" :alt="currentUser.name || 'User avatar'"
                                class="h-full w-full rounded-full object-cover" />
                        </div>
                        <div class="flex flex-col flex-1">
                            <p v-if="currentUser.name" class="font-medium text-sm">{{ currentUser.name }}</p>
                            <p v-if="currentUser.email" class="text-xs text-muted-foreground">{{ currentUser.email }}</p>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" @click="handleLogout" class="w-full justify-center">
                        Déconnexion
                    </Button>
                </div>
            </nav>
        </div>
    </header>
</template>

<style lang="postcss">
/* Removed legacy nav styles in favor of Tailwind classes in NavigationMenu */
</style>
