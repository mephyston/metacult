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

// 2. Primary Purchase Offer (Instant Gaming OR Amazon)
const primaryOffer = computed(() => {
  // Priority: Instant Gaming > Amazon > Generic Purchase
  const ig = props.offers.find((o) => o.provider === 'Instant Gaming');
  if (ig)
    return {
      ...ig,
      label: 'Instant Gaming',
      color: 'bg-orange-500 hover:bg-orange-600',
      icon: 'ig',
    };

  const amz = props.offers.find((o) => o.provider === 'Amazon');
  if (amz)
    return {
      ...amz,
      label: 'Amazon',
      color: 'bg-[#FF9900] hover:bg-[#FF9900]/90 text-black',
      icon: 'amz',
    }; // Amazon colors

  return null;
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

const hasOffers = computed(() => props.offers.length > 0);

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
        v-if="primaryOffer"
        :href="primaryOffer.url"
        target="_blank"
        title="Voir l'offre / Acheter"
        class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 group hover:bg-white/20 shadow-lg"
        @click.stop
        @touchstart.stop
        @mousedown.stop
      >
        <ShoppingCart
          class="w-5 h-5 text-white"
          :class="{
            'text-amber-400': primaryOffer.icon === 'amz',
            'text-orange-400': primaryOffer.icon === 'ig',
          }"
        />
      </a>
      <!-- Fallback or alternative for Card when no IG offer? For now, nothing -->
    </div>

    <!-- === DETAIL VARIANT (Full Page) === -->
    <div v-else class="w-full flex flex-col gap-6">
      <!-- Section Header -->
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <Gamepad2 v-if="cheapSharkOffer || primaryOffer" class="w-5 h-5" />
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
        v-if="cheapSharkOffer || primaryOffer"
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

        <!-- CTA Primary (IG or Amazon) -->
        <a
          v-if="primaryOffer"
          :href="primaryOffer.url"
          target="_blank"
          class="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98]"
          :class="[primaryOffer.color]"
        >
          <ShoppingCart class="w-5 h-5" />
          <span>Voir sur {{ primaryOffer.label }}</span>
          <ExternalLink class="w-4 h-4 opacity-70" />
        </a>

        <p
          v-if="primaryOffer?.icon === 'ig'"
          class="text-[10px] text-center opacity-40 mt-1"
        >
          Partenaire officiel - Code: Metacult
        </p>
      </div>
    </div>
  </div>
</template>
