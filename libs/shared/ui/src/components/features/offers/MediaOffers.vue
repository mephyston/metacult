<script setup lang="ts">
import { computed } from 'vue';
import { ShoppingCart, ExternalLink, Gamepad2, Tv } from 'lucide-vue-next';

export interface OfferProp {
  id?: string;
  provider: string;
  price: number | null;
  url: string;
  type: string; // 'subscription' | 'purchase' | 'rent'
  currency: string;
  isAffiliated?: boolean;
  category?: string;
}

const props = withDefaults(
  defineProps<{
    offers: OfferProp[];
    variant?: 'card' | 'detail';
    mediaTitle: string;
  }>(),
  {
    variant: 'detail',
    offers: () => [],
    mediaTitle: '',
  },
);

// --- LOGIC ---

// 1. CheapShark / Official Price
const cheapSharkOffer = computed(() => {
  return props.offers.find(
    (o) =>
      o.provider.toLowerCase().includes('cheapshark') ||
      o.provider.toLowerCase().includes('steam') ||
      o.provider.toLowerCase().includes('humble'),
  );
});

// 2. Instant Gaming URL
const instantGamingUrl = computed(() => {
  const igOffer = props.offers.find((o) => o.provider === 'Instant Gaming');
  if (igOffer) return igOffer.url;

  // Fallback generation logic
  const ref = 'metacult'; // Should ideally come from ref/config, but hardcoded fallback per prompt instruction implicitly or valid generic
  return `https://www.instant-gaming.com/fr/search/?q=${encodeURIComponent(props.mediaTitle)}&igr=${ref}`;
});

// 3. Streaming Offers
const streamingOffers = computed(() => {
  const priority = ['netflix', 'amazon prime video', 'disney plus', 'apple tv'];

  return props.offers
    .filter((o) => o.type === 'subscription' || o.type === 'rent')
    .sort((a, b) => {
      const idxA = priority.indexOf(a.provider.toLowerCase());
      const idxB = priority.indexOf(b.provider.toLowerCase());
      // Items in priority list come first
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
});

const hasOffers = computed(() => props.offers.length > 0 || props.mediaTitle);

// 4. Price Formatting
const formatPrice = (price: number | null, currency: string) => {
  if (!price) return null;
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(price);
  } catch (e) {
    return `${price} ${currency}`;
  }
};

// 5. Styling Helpers
const getStreamingColor = (provider: string) => {
  const p = provider.toLowerCase();
  if (p.includes('netflix')) return 'bg-[#E50914] text-white';
  if (p.includes('prime')) return 'bg-[#00A8E1] text-white';
  if (p.includes('disney')) return 'bg-[#113CCF] text-white';
  if (p.includes('apple')) return 'bg-[#2C2C2C] text-white';
  return 'bg-secondary text-secondary-foreground';
};

const getProviderInitials = (provider: string) => {
  if (provider.toLowerCase().includes('prime')) return 'P';
  if (provider.toLowerCase().includes('disney')) return 'D+';
  return provider.slice(0, 1).toUpperCase();
};
</script>

<template>
  <div v-if="hasOffers" class="w-full flex justify-center">
    <!-- === CARD VARIANT (Compact / Swipe) === -->
    <div v-if="variant === 'card'" class="pointer-events-auto">
      <a
        :href="instantGamingUrl"
        target="_blank"
        @click.stop
        class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur shadow-lg border border-white/10 transition-transform active:scale-95 group hover:bg-white dark:hover:bg-zinc-700"
      >
        <ShoppingCart class="w-4 h-4 text-orange-500" />
        <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100">
          {{
            cheapSharkOffer?.price
              ? `Dès ${formatPrice(cheapSharkOffer.price, cheapSharkOffer.currency)}`
              : 'Acheter'
          }}
        </span>
        <ExternalLink class="w-3 h-3 text-zinc-400 group-hover:text-zinc-500" />
      </a>
    </div>

    <!-- === DETAIL VARIANT (Full Page) === -->
    <div v-else class="w-full flex flex-col gap-6">
      <!-- Section Header -->
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <Gamepad2 v-if="cheapSharkOffer || instantGamingUrl" class="w-5 h-5" />
        <Tv v-else class="w-5 h-5" />
        Où regarder / Acheter
      </h3>

      <!-- 1. Streaming Grid (Movies/Shows) -->
      <div v-if="streamingOffers.length > 0" class="flex flex-wrap gap-3">
        <a
          v-for="offer in streamingOffers"
          :key="offer.id || offer.provider"
          :href="offer.url"
          target="_blank"
          class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm hover:scale-105 transition-transform"
          :class="getStreamingColor(offer.provider)"
          :title="offer.provider"
        >
          {{ getProviderInitials(offer.provider) }}
        </a>
      </div>

      <!-- 2. Games Pricing Block -->
      <div
        v-if="cheapSharkOffer || instantGamingUrl.includes('instant-gaming')"
        class="flex flex-col gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50"
      >
        <!-- Official Price (Neutral) -->
        <div
          v-if="cheapSharkOffer && cheapSharkOffer.price"
          class="flex justify-between items-center text-sm text-muted-foreground"
        >
          <span>Prix conseillé</span>
          <span class="line-through decoration-red-400/50">{{
            formatPrice(cheapSharkOffer.price, cheapSharkOffer.currency)
          }}</span>
        </div>

        <!-- CTA Instant Gaming (Primary) -->
        <a
          :href="instantGamingUrl"
          target="_blank"
          class="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
        >
          <ShoppingCart class="w-5 h-5" />
          <span>Voir sur Instant Gaming</span>
          <ExternalLink class="w-4 h-4 opacity-70" />
        </a>

        <p class="text-[10px] text-center opacity-40 mt-1">
          Partenaire officiel - Code: Metacult
        </p>
      </div>
    </div>
  </div>
</template>
