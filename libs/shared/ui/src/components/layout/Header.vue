<script setup lang="ts">
import { ref } from 'vue';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '../ui/navigation-menu';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { cn } from '../../lib/utils';

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Playstation 5',
    href: '/ps5',
    description:
      'Parcourez une collection infinie de films, jeux et séries.',
  },
  {
    title: 'PC',
    href: '/pc',
    description:
      'Rejoignez des squads et comparez vos goûts avec vos amis.',
  },
  {
    title: 'Switch 2',
    href: '/switch',
    description:
      'Créez et partagez vos listes ultimes via le Backlog Unifié.',
  },
]
</script>

<template>
  <header id="header" class="bg-header relative z-50 h-20 border-b border-white/5">
    <div class="container mx-auto px-4 h-full">
      <div class="navbar h-full flex items-center justify-between">
        
        <!-- Navbar Left: Logo & Nav -->
        <div class="navbar-left flex items-center h-full gap-8">
            <!-- Logo -->
            <a href="/" class="logo flex items-center h-full">
                <span class="text-2xl font-display font-bold text-white uppercase tracking-wider">Metacult</span>
            </a>

            <!-- Desktop Nav (Left aligned) -->
            <div class="hidden md:flex">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger class="bg-transparent text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 data-[active]:bg-white/5 data-[state=open]:bg-white/5">
                                Jeux
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul class="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                    <li class="row-span-3">
                                        <NavigationMenuLink as-child>
                                        <a
                                            class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                                            href="/"
                                        >
                                            <div class="mb-2 mt-4 text-lg font-medium text-white">
                                            A l'affiche
                                            </div>
                                            <p class="text-sm leading-tight text-white/90">
                                            Last of Us
                                            </p>
                                        </a>
                                        </NavigationMenuLink>
                                    </li>
                                    
                                    <li v-for="component in components" :key="component.title">
                                        <NavigationMenuLink as-child>
                                            <a
                                                :href="component.href"
                                                class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                            >
                                                <div class="text-sm font-medium leading-none">{{ component.title }}</div>
                                                <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                {{ component.description }}
                                                </p>
                                            </a>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink href="/films" :class="cn(navigationMenuTriggerStyle(), 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5')">
                                Films
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                          <NavigationMenuItem>
                            <NavigationMenuLink href="/series" :class="cn(navigationMenuTriggerStyle(), 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5')">
                                Séries
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink href="/bd" :class="cn(navigationMenuTriggerStyle(), 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5')">
                                BDs
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

            <!-- Actions -->
            <slot name="actions" />
            
            <!-- Connect Button -->
            <Button variant="default" size="sm" href="/auth/login">
                Se connecter
            </Button>

            <!-- Theme Toggle -->
            <ThemeToggle class="text-white hover:bg-white/10 hover:text-white" />

            <!-- Mobile Menu Button -->
            <button 
                @click="toggleMenu"
                class="md:hidden text-gray-400 hover:text-white ml-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
      </div>
    </div>

    <!-- Mobile Nav -->
    <div v-show="isOpen" class="md:hidden border-t border-gray-800 bg-header absolute w-full left-0 top-20 shadow-xl z-50">
      <nav class="flex flex-col p-4 gap-4">
        <a href="/features" class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Fonctionnalités</a>
        <a href="/docs" class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Documentation</a>
        <a href="/pricing" class="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Tarifs</a>
        <slot name="mobile-nav" />
      </nav>
    </div>
  </header>
</template>

<style lang="postcss">
/* Removed legacy nav styles in favor of Tailwind classes in NavigationMenu */
</style>
