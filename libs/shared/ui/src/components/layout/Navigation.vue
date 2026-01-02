<script setup lang="ts">
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '../ui/navigation-menu';
import { cn } from '../../lib/utils';

const components: { title: string; href: string; description: string }[] = [
    {
        title: 'Playstation 5',
        href: '/games/ps5',
        description: 'Parcourez une collection infinie de films, jeux et séries.',
    },
    {
        title: 'PC',
        href: '/games/pc',
        description: 'Rejoignez des squads et comparez vos goûts avec vos amis.',
    },
    {
        title: 'Switch 2',
        href: '/games/switch',
        description: 'Créez et partagez vos listes ultimes via le Backlog Unifié.',
    },
];
</script>

<template>
    <NavigationMenu>
        <NavigationMenuList>
            <NavigationMenuItem>
                <NavigationMenuLink href="/discover"
                    :class="cn(navigationMenuTriggerStyle(), 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent')">
                    Découvrir
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuTrigger
                    class="bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent data-[active]:bg-accent data-[state=open]:bg-accent">
                    Jeux
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                    <ul class="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li class="row-span-3">
                            <NavigationMenuLink as-child>
                                <a class="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/50 to-primary p-6 no-underline outline-none focus:shadow-md"
                                    href="/games">
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
                                <a :href="component.href"
                                    class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
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
                <NavigationMenuLink href="/movies"
                    :class="cn(navigationMenuTriggerStyle(), 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent')">
                    Films
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink href="/series"
                    :class="cn(navigationMenuTriggerStyle(), 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent')">
                    Séries
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink href="/books"
                    :class="cn(navigationMenuTriggerStyle(), 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent')">
                    Livres
                </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
</template>
