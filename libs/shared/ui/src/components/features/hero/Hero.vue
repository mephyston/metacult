<script setup lang="ts">
import {
  ArrowRight,
  Calendar,
  MapPin,
  ThumbsUp,
  MessageSquare,
  MoreVertical,
} from 'lucide-vue-next';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { getApiUrl } from '../../../lib/utils';
import { TextRotator } from '../../ui/text-rotator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { ref, computed } from 'vue';

interface Media {
  id: string;
  title: string;
  releaseYear?: number | null;
  type?: string;
  coverUrl?: string | null;
  posterUrl?: string | null;
  tags?: string[];
  eloScore?: number;
}

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
  fetchpriority?: 'high' | 'low' | 'auto';
  items?: Array<Media>;
}

const props = withDefaults(defineProps<HeroProps>(), {
  heading: 'Réservez votre prochaine expérience.',
  description:
    'Donnez votre avis sur vos jeux vidéo, films, séries et BDs préférés en un simple geste. Rejoignez la communauté Metacult !',
  ctaText: 'Créez votre compte',
  ctaLink: '/register',
  secondaryCtaText: 'Connectez-vous',
  secondaryCtaLink: '/login',
  badge: 'Nouvelle Version 2.0',
  items: () => [],
});

// Feature Item logic (Top Trend)
const featureItem = computed(() => {
  if (props.items && props.items.length > 0) {
    return props.items[0];
  }
  return null;
});

// Bottom list items (Next 3 trends)
const bottomListItems = computed(() => {
  if (props.items && props.items.length > 1) {
    return props.items.slice(1, 4);
  }
  return [];
});

// Computed Display Values
const displayHeading = computed(() =>
  featureItem.value ? featureItem.value.title : props.heading,
);

const displayDescription = computed(() =>
  featureItem.value
    ? `Le Top #1 du moment sur Metacult avec un score ELO de ${featureItem.value.eloScore}. Rejoignez l'arène pour le défier !`
    : props.description,
);

const displayBadge = computed(() =>
  featureItem.value
    ? `Score MetaCult : ${featureItem.value.eloScore}`
    : props.badge,
);

const displayImage = computed(() =>
  featureItem.value
    ? featureItem.value.coverUrl || featureItem.value.posterUrl || props.image
    : props.image,
);

const displayCtaLink = computed(() =>
  featureItem.value
    ? `${import.meta.env.PUBLIC_WEBAPP_URL || 'http://localhost:4201'}/arena`
    : props.ctaLink,
);

const displayCtaText = computed(() =>
  featureItem.value ? "Le défier dans l'arène" : props.ctaText,
);
</script>

<template>
  <section
    class="relative w-full overflow-hidden bg-background py-12 sm:py-16 lg:py-24 text-foreground"
  >
    <!-- Background Image with Overlay for Trend Mode -->
    <div v-if="featureItem" class="absolute inset-0 z-0">
      <img
        :src="displayImage"
        class="w-full h-full object-cover opacity-20 blur-sm scale-110"
        alt="Hero Background"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
      ></div>
    </div>

    <div
      class="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 max-xl:justify-center sm:gap-16 sm:px-6 lg:grid-cols-2 lg:gap-24 lg:px-8 relative z-10"
    >
      <!-- Left Content -->
      <div class="flex flex-col justify-center gap-8 sm:gap-10">
        <div class="space-y-4">
          <Badge
            variant="outline"
            class="w-fit rounded-full border-border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm"
          >
            {{ displayBadge }}
          </Badge>
          <h1
            class="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl text-foreground"
          >
            <template v-if="featureItem">
              {{ displayHeading }}
            </template>
            <template v-else>
              Swipez, notez, partagez vos
              <TextRotator />
            </template>
          </h1>
          <p class="max-w-xl text-lg text-muted-foreground">
            {{ displayDescription }}
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex flex-wrap gap-4">
          <Button
            size="lg"
            class="h-12 px-8 relative overflow-hidden rounded-lg text-base font-medium shadow-md transition-all hover:bg-primary/90 before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000 hover:before:bg-[position:-100%_0,0_0] dark:before:bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_50%,transparent_75%,transparent_100%)]"
            :href="displayCtaLink"
          >
            {{ displayCtaText }}
          </Button>
          <Button
            size="lg"
            variant="outline"
            class="h-12 px-8 rounded-lg text-base border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
            :href="secondaryCtaLink"
          >
            {{ secondaryCtaText }}
          </Button>
        </div>

        <!-- Trends Static List (Replacemenet for Marquee) -->
        <div v-if="bottomListItems.length > 0" class="mt-8">
          <h3
            class="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider"
          >
            En Tendance aussi
          </h3>
          <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div
              v-for="media in bottomListItems"
              :key="media.id"
              class="bg-card text-card-foreground flex flex-col rounded-md border shadow-sm w-[140px] h-[210px] overflow-hidden shrink-0"
            >
              <div class="relative h-[70%] w-full overflow-hidden bg-muted">
                <img
                  :src="
                    media.coverUrl ||
                    media.posterUrl ||
                    'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=300&h=450&fit=crop'
                  "
                  class="object-cover w-full h-full"
                  :alt="media.title"
                  loading="lazy"
                />
                <div class="absolute top-1 left-1">
                  <Badge
                    variant="secondary"
                    class="bg-background/90 backdrop-blur-md text-foreground border-white/10 shadow-sm font-semibold px-1 py-0 text-[9px] capitalize"
                  >
                    {{ media.type }}
                  </Badge>
                </div>
                <!-- ELO Badge -->
                <div v-if="media.eloScore" class="absolute bottom-1 right-1">
                  <Badge
                    variant="default"
                    class="text-[9px] px-1 py-0 h-4 bg-primary/90"
                  >
                    {{ media.eloScore }}
                  </Badge>
                </div>
              </div>
              <div class="p-2">
                <h4
                  class="text-xs font-bold leading-tight line-clamp-2"
                  :title="media.title"
                >
                  {{ media.title }}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content (Geometric Background & Card) -->
      <div class="relative flex items-center justify-center lg:justify-end">
        <!-- Geometric SVG Background only if NOT in feature mode -->
        <svg
          v-if="!featureItem"
          width="649"
          height="634"
          viewBox="0 0 649 634"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="absolute opacity-40 dark:opacity-20 lg:scale-110 pointer-events-none -z-10 text-primary dark:text-foreground/20"
        >
          <path
            d="M9.13564 162.358C-36.0962 -1.54721 131.459 -18.2308 252.379 31.2602C322.93 56.7127 369.262 -22.4429 456.661 9.14714C544.06 40.7371 439.287 140.246 573.018 191.316C706.749 242.387 641.462 470.888 524.579 473.52C407.696 476.153 439.813 514.587 322.93 602.513C206.047 690.438 9.1359 568.29 58.1004 439.298C107.065 310.305 58.0998 339.789 9.13564 162.358Z"
            stroke="currentColor"
            stroke-opacity="0.2"
            stroke-width="3"
          />
          <path
            d="M260.698 289.918C255.48 274.307 279.924 249.122 299.58 259.87C317.58 269.712 335.909 263.074 348.018 267.462C379.898 279.014 368.171 285.128 382.422 298.847C399.764 315.542 408.039 359.257 368.171 359.257C335.382 359.257 345.193 375.183 320.64 382.239C296.087 389.295 268.242 377.284 268.242 345.661C268.242 333.785 269.391 315.919 260.698 289.918Z"
            stroke="currentColor"
            stroke-width="3"
          />
          <circle
            cx="400"
            cy="200"
            r="150"
            fill="currentColor"
            fill-opacity="0.05"
            filter="url(#blur)"
          />
        </svg>

        <!-- Main Floating Card -->
        <slot name="interactive-card">
          <!-- Default Static Card (fallback si pas de slot fourni) -->
          <!-- Use feature item as default static card if available -->
          <div
            class="relative w-full max-w-sm animate-in zoom-in-50 fade-in duration-1000 ease-out fill-mode-both"
          >
            <!-- Glow Behind Card -->
            <div
              class="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-[2rem] blur-xl -z-10 opacity-70 dark:opacity-30 dark:from-primary/10"
            />

            <div
              class="bg-card text-card-foreground flex flex-col h-[520px] rounded-2xl border shadow-xl p-0 relative overflow-hidden group"
            >
              <!-- Image Section (Occupies ~72% of space) -->
              <div
                class="relative h-[72%] w-full overflow-hidden rounded-t-2xl"
              >
                <img
                  :src="
                    displayImage ||
                    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop'
                  "
                  :sizes="imageSizes"
                  class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  alt="Review Media"
                />

                <!-- Media Type Tag -->
                <div class="absolute top-4 left-4">
                  <Badge
                    variant="secondary"
                    class="bg-background/90 backdrop-blur-md text-foreground border-white/10 shadow-sm font-semibold px-3 py-1"
                  >
                    {{ featureItem?.type || 'Jeu Vidéo' }}
                  </Badge>
                </div>
              </div>

              <!-- Content Section -->
              <div class="flex flex-col justify-between flex-1 p-5">
                <div class="flex flex-col gap-2">
                  <!-- Title & Date -->
                  <div class="flex items-baseline justify-between">
                    <h3 class="text-xl font-bold leading-tight tracking-tight">
                      <template v-if="featureItem">
                        {{ featureItem.title }}
                      </template>
                      <template v-else> The Last of Us Part II </template>
                      <span
                        class="text-muted-foreground font-normal ml-1 text-base relative"
                        >({{ featureItem?.releaseYear || '2020' }})</span
                      >
                    </h3>
                  </div>

                  <!-- Genres -->
                  <div class="flex flex-wrap gap-2">
                    <template v-if="featureItem && featureItem.tags">
                      <Badge
                        v-for="tag in featureItem.tags.slice(0, 3)"
                        :key="tag"
                        variant="outline"
                        class="text-xs font-medium text-muted-foreground border-border"
                      >
                        {{ tag }}
                      </Badge>
                    </template>
                    <template v-else>
                      <Badge
                        variant="outline"
                        class="text-xs font-medium text-muted-foreground border-border"
                      >
                        Post-apocalypse</Badge
                      >
                      <Badge
                        variant="outline"
                        class="text-xs font-medium text-muted-foreground border-border"
                        >Aventure
                      </Badge>
                      <Badge
                        variant="outline"
                        class="text-xs font-medium text-muted-foreground border-border"
                        >Drame
                      </Badge>
                    </template>
                  </div>
                </div>

                <!-- Footer: Friends who liked it or Rating -->
                <div class="mt-auto pt-2 flex items-center justify-end">
                  <Badge
                    v-if="featureItem && featureItem.eloScore"
                    variant="default"
                    class="text-xs"
                  >
                    ELO {{ featureItem.eloScore }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </section>
</template>
