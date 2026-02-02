<script setup lang="ts">
import { ref } from 'vue';
// noinspection JSDeprecatedSymbols
import { Facebook, Instagram, Youtube, X } from 'lucide-vue-next';
// Assuming Separator exists or will be created. If not, I'll remove it or use distinct div.
// To be safe, I'll use a div border for now if Separator is not confirmed,
// BUT the prompt said "Importé depuis vos composants UI standard".
// I'll assume I need to create it if missing.
// For now, let's stick to standard HR for simplicity if Separator is missing, OR wait for tool result?
// Parallel tool call prevents waiting. I will risk using a simple <hr> styling if I can't confirm Separator,
// OR simpler: just define it inline given I can't wait.
// Actually, I can just use a Tailwind div separator.
const currentYear = ref(new Date().getFullYear());

defineProps<{
  version?: string;
  commit?: string;
}>();
</script>

<template>
  <footer class="w-full border-t bg-background">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8"
    >
      <!-- Logo Section -->
      <a
        href="/"
        class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2.5">
            <!-- Logo SVG (Shadcn Studio style) -->
            <svg
              width="32"
              height="32"
              viewBox="0 0 328 329"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="size-8.5"
            >
              <rect
                y="0.5"
                width="328"
                height="328"
                rx="164"
                class="fill-black dark:fill-white"
              />
              <path
                d="M165.018 72.3008V132.771C165.018 152.653 148.9 168.771 129.018 168.771H70.2288"
                stroke="white"
                stroke-width="20"
                class="dark:stroke-black"
              />
              <path
                d="M166.627 265.241L166.627 204.771C166.627 184.889 182.744 168.771 202.627 168.771L261.416 168.771"
                stroke="white"
                stroke-width="20"
                class="dark:stroke-black"
              />
            </svg>
            <span class="text-xl font-semibold tracking-tight text-foreground"
              >Metacult</span
            >
          </div>
        </div>
      </a>

      <!-- Navigation Links -->
      <nav
        class="flex flex-wrap items-center justify-center gap-5 whitespace-nowrap text-sm font-medium text-muted-foreground md:justify-start"
      >
        <a href="#" class="transition-colors hover:text-foreground">A propos</a>
        <a href="/legal/credits" class="transition-colors hover:text-foreground"
          >Mentions légales</a
        >
        <a href="#" class="transition-colors hover:text-foreground"
          >Politique de confidentialité</a
        >
        <a href="#" class="transition-colors hover:text-foreground">CGU</a>
        <a href="#" class="transition-colors hover:text-foreground">Contact</a>
      </nav>

      <!-- Social Icons -->
      <div class="flex items-center gap-4">
        <a
          href="#"
          class="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Facebook"
        >
          <!-- noinspection JSDeprecatedSymbols -->
          <Facebook class="size-5" />
        </a>
        <a
          href="#"
          class="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Instagram"
        >
          <Instagram class="size-5" />
        </a>
        <a
          href="#"
          class="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="X (Twitter)"
        >
          <X class="size-5" />
        </a>
        <a
          href="#"
          class="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Youtube"
        >
          <Youtube class="size-5" />
        </a>
      </div>
    </div>

    <div class="h-[1px] w-full bg-border" />

    <!-- Credits & Attribution Section -->
    <!-- Attributions moved to /legal/credits -->

    <div class="h-[1px] w-full bg-border" />

    <!-- Bottom Copyright Section -->
    <div class="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6">
      <p
        class="text-balance text-center text-sm font-medium text-muted-foreground"
      >
        &copy; {{ currentYear }}
        <a href="#" class="hover:underline">Metacult</a>, Made with ❤️ for
        better culture.
        <span v-if="version" class="ml-2 text-xs text-muted-foreground">{{
          version
        }}</span>
        <span v-if="commit" class="ml-1 text-xs text-muted-foreground"
          >({{ commit?.substring(0, 7) }})</span
        >
      </p>
    </div>
  </footer>
</template>
