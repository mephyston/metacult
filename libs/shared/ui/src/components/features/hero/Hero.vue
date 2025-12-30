```vue
<script setup lang="ts">
import { ArrowRight, Calendar, MapPin, ThumbsUp, MessageSquare, MoreVertical } from 'lucide-vue-next';
import { Badge } from '../../ui/badge'; // Keeping original path for consistency
import { Button } from '../../ui/button'; // Keeping original import { cn } from '../../../lib/utils'
import { TextRotator } from '../../ui/text-rotator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';

interface HeroProps {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image?: string;
  imageSizes?: string;
  badge?: string;
}

withDefaults(defineProps<HeroProps>(), {
  heading: 'Réservez votre prochaine expérience.',
  description: 'Donnez votre avis sur vos jeux vidéo, films, séries et BDs préférés en un simple geste. Rejoignez la communauté Metacult !',
  ctaText: 'Créez votre compte',
  ctaLink: '/register',
  secondaryCtaText: 'Connctez-vous',
  secondaryCtaLink: '/login',
  badge: 'Nouvelle Version 2.0'
});

const upcomingShows = [
  { title: "Dune: Part Two", date: "Sun, Oct 12", time: "20:00", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=300&auto=format&fit=crop" },
  { title: "Oppenheimer", date: "Fri, Sep 5", time: "18:00", image: "https://images.unsplash.com/photo-1506157786151-b8491531f436?q=80&w=300&auto=format&fit=crop" },
  { title: "Interstellar", date: "Sat, Nov 15", time: "19:30", image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=300&auto=format&fit=crop" },
  { title: "Blade Runner 2049", date: "Fri, Dec 12", time: "21:00", image: "https://images.unsplash.com/photo-1542662565-7e4b66b29a30?q=80&w=300&auto=format&fit=crop" },
];
</script>

<template>
  <section class="relative w-full overflow-hidden bg-background py-12 sm:py-16 lg:py-24 text-foreground">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 max-xl:justify-center sm:gap-16 sm:px-6 lg:grid-cols-2 lg:gap-24 lg:px-8 relative z-10">
          
          <!-- Left Content -->
          <div class="flex flex-col justify-center gap-8 sm:gap-10">
              <div class="space-y-4">
                  <Badge variant="outline" class="w-fit rounded-full border-border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                      Saison 2025
                  </Badge>
                  <h1 class="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl text-foreground">
                      Swipez, notez, partagez vos
                      <TextRotator />
                  </h1>
                  <p class="max-w-xl text-lg text-muted-foreground">
                      {{ description }}
                  </p>
              </div>

              <!-- Buttons -->
              <div class="flex flex-wrap gap-4">
                  <Button size="lg" class="h-12 px-8 relative overflow-hidden rounded-lg text-base font-medium shadow-md transition-all hover:bg-primary/90 before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000 hover:before:bg-[position:-100%_0,0_0] dark:before:bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_50%,transparent_75%,transparent_100%)]" :href="ctaLink">
                      {{ ctaText }}
                  </Button>
                  <Button size="lg" variant="outline" class="h-12 px-8 rounded-lg text-base border-input bg-transparent hover:bg-accent hover:text-accent-foreground" :href="secondaryCtaLink">
                      {{ secondaryCtaText }}
                  </Button>
              </div>

              <!-- Upcoming Shows Marquee -->
              <div>
                  <h3 class="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      À l'affiche cette semaine
                  </h3>
                  <div class="relative group">
                      <!-- Fade Gradients -->
                      <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent"></div>
                      <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"></div>
                      
                      <!-- Marquee Container -->
                      <div class="flex overflow-hidden gap-[var(--gap)] select-none" style="--gap: 1rem; --duration: 40s;">
                          <div v-for="i in 4" :key="i" class="flex shrink-0 animate-marquee items-center justify-around gap-[var(--gap)] group-hover:[animation-play-state:paused]">
                              <div v-for="(show, index) in upcomingShows" :key="index" class="bg-card text-card-foreground flex flex-col rounded-xl border py-4 shadow-sm w-[240px]">
                                  <div class="px-4 pb-3">
                                      <img :src="show.image" class="aspect-video w-full rounded-lg object-cover h-28" :alt="show.title" />
                                  </div>
                                  <div class="px-4">
                                      <div class="text-base font-medium truncate">{{ show.title }}</div>
                                      <div class="text-xs text-muted-foreground flex justify-between mt-1">
                                          <span>{{ show.date }}</span>
                                          <span>{{ show.time }}</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Right Content (Geometric Background & Card) -->
          <div class="relative flex items-center justify-center lg:justify-end">
              <!-- Geometric SVG Background (Extracted from User) -->
              <svg width="649" height="634" viewBox="0 0 649 634" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute opacity-40 dark:opacity-20 lg:scale-110 pointer-events-none -z-10 text-primary dark:text-foreground/20">
                  <path d="M9.13564 162.358C-36.0962 -1.54721 131.459 -18.2308 252.379 31.2602C322.93 56.7127 369.262 -22.4429 456.661 9.14714C544.06 40.7371 439.287 140.246 573.018 191.316C706.749 242.387 641.462 470.888 524.579 473.52C407.696 476.153 439.813 514.587 322.93 602.513C206.047 690.438 9.1359 568.29 58.1004 439.298C107.065 310.305 58.0998 339.789 9.13564 162.358Z" stroke="currentColor" stroke-opacity="0.2" stroke-width="3"></path>
                  <path d="M260.698 289.918C255.48 274.307 279.924 249.122 299.58 259.87C317.58 269.712 335.909 263.074 348.018 267.462C379.898 279.014 368.171 285.128 382.422 298.847C399.764 315.542 408.039 359.257 368.171 359.257C335.382 359.257 345.193 375.183 320.64 382.239C296.087 389.295 268.242 377.284 268.242 345.661C268.242 333.785 269.391 315.919 260.698 289.918Z" stroke="currentColor" stroke-width="3"></path>
                  <circle cx="400" cy="200" r="150" fill="currentColor" fill-opacity="0.05" filter="url(#blur)" />
              </svg>

              <!-- Main Floating Card -->
              <div class="relative w-full max-w-sm animate-in zoom-in-50 fade-in duration-1000 ease-out fill-mode-both">
                  <!-- Glow Behind Card -->
                  <div class="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-[2rem] blur-xl -z-10 opacity-70 dark:opacity-30 dark:from-primary/10"></div>

                  <div class="bg-card text-card-foreground flex flex-col h-[520px] rounded-2xl border shadow-xl p-0 relative overflow-hidden group">
                      
                      <!-- Image Section (Occupies ~72% of space) -->
                      <div class="relative h-[72%] w-full overflow-hidden rounded-t-2xl">
                          <img :src="image || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop'" :sizes="imageSizes" class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" alt="Review Media" />
                          
                          <!-- Media Type Tag -->
                          <div class="absolute top-4 left-4">
                              <Badge variant="secondary" class="bg-background/90 backdrop-blur-md text-foreground border-white/10 shadow-sm font-semibold px-3 py-1">
                                  Jeu Vidéo
                              </Badge>
                          </div>
                      </div>

                      <!-- Content Section -->
                      <div class="flex flex-col justify-between flex-1 p-5">
                          <div class="flex flex-col gap-2">
                              <!-- Title & Date -->
                              <div class="flex items-baseline justify-between">
                                  <h3 class="text-xl font-bold leading-tight tracking-tight">
                                      The Last of Us Part II <span class="text-muted-foreground font-normal ml-1 text-base">(2020)</span>
                                  </h3>
                              </div>
                              
                              <!-- Genres -->
                              <div class="flex flex-wrap gap-2">
                                  <Badge variant="outline" class="text-xs font-medium text-muted-foreground border-border">Post-apocalypse</Badge>
                                  <Badge variant="outline" class="text-xs font-medium text-muted-foreground border-border">Aventure</Badge>
                                  <Badge variant="outline" class="text-xs font-medium text-muted-foreground border-border">Drame</Badge>
                              </div>
                          </div>




                          <!-- Footer: Friends who liked it -->
                          <div class="mt-auto pt-2 flex items-center justify-end">
                              <TooltipProvider>
                                  <div class="flex -space-x-3 hover:space-x-1 transition-all duration-300 isolate">
                                      <Tooltip>
                                          <TooltipTrigger as-child>
                                              <img class="relative inline-block h-10 w-10 rounded-full ring-2 ring-background object-cover grayscale hover:grayscale-0 transition-all z-30 cursor-pointer" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" alt="User 1" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                              <p>Alice</p>
                                          </TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                          <TooltipTrigger as-child>
                                              <img class="relative inline-block h-10 w-10 rounded-full ring-2 ring-background object-cover grayscale hover:grayscale-0 transition-all z-20 cursor-pointer" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User 2" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                              <p>Bob</p>
                                          </TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                          <TooltipTrigger as-child>
                                              <img class="relative inline-block h-10 w-10 rounded-full ring-2 ring-background object-cover grayscale hover:grayscale-0 transition-all z-10 cursor-pointer" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" alt="User 3" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                              <p>Charlie</p>
                                          </TooltipContent>
                                      </Tooltip>

                                      <span class="relative inline-block h-10 w-10 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-medium z-0">+5</span>
                                  </div>
                              </TooltipProvider>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </section>
</template>
