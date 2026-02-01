<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Home, Swords, Sparkles, Target, User } from 'lucide-vue-next';

const route = useRoute();

const items = [
  {
    label: 'Accueil',
    icon: Home,
    to: '/',
    match: ['/'],
  },
  {
    label: 'Mix',
    icon: Sparkles,
    to: '/swipe',
  },
  {
    label: 'Radar',
    icon: Target,
    to: '/discover',
  },
  {
    label: 'Arène',
    icon: Swords,
    to: '/arena',
    badge: 3, // TODO: Connect to real notification count
  },
  {
    label: 'Profil',
    icon: User,
    to: '/profile',
  },
];

const isActive = (path: string, match?: string[]) => {
  if (match) {
    return match.includes(route.path);
  }
  // Exact match for root, prefix for others if needed, but for now simple check
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 pb-safe md:hidden"
  >
    <div class="flex items-center justify-around h-16 px-2">
      <NuxtLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 group"
        :class="
          isActive(item.to, item.match)
            ? 'text-primary-500'
            : 'text-gray-400 hover:text-gray-200'
        "
      >
        <div class="relative">
          <component
            :is="item.icon"
            class="w-6 h-6 transition-transform duration-200"
            :class="
              isActive(item.to, item.match)
                ? 'scale-110'
                : 'group-active:scale-95'
            "
            stroke-width="2"
          />

          <!-- Notification Badge -->
          <span
            v-if="item.badge"
            class="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-black"
          >
            {{ item.badge }}
          </span>
        </div>

        <span class="text-[10px] font-medium tracking-tight">
          {{ item.label }}
        </span>

        <!-- Active Indicator Dot -->
        <span
          v-if="isActive(item.to, item.match)"
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        />
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
