<script setup lang="ts">
import { ref } from 'vue';
// NavigationMenu imports removed as they are replaced by Navigation.vue component
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import Navigation from './Navigation.vue';
import { cn } from '../../lib/utils';

const isOpen = ref(false);

const toggleMenu = () => {
    isOpen.value = !isOpen.value;
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

                    <!-- Connect Button -->
                    <Button variant="default" size="sm" href="/auth/login">
                        Se connecter
                    </Button>

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
            class="md:hidden border-t border-gray-800 bg-header absolute w-full left-0 top-20 shadow-xl z-50">
            <nav class="flex flex-col p-4 gap-4">
                <slot name="mobile-nav" />
            </nav>
        </div>
    </header>
</template>

<style lang="postcss">
/* Removed legacy nav styles in favor of Tailwind classes in NavigationMenu */
</style>
