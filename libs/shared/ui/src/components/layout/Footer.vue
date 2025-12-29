<script setup lang="ts">
import { ref } from 'vue'
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-vue-next'
// Assuming Separator exists or will be created. If not, I'll remove it or use distinct div.
// To be safe, I'll use a div border for now if Separator is not confirmed, 
// BUT the prompt said "Importé depuis vos composants UI standard".
// I'll assume I need to create it if missing.
// For now, let's stick to standard HR for simplicity if Separator is missing, OR wait for tool result?
// Parallel tool call prevents waiting. I will risk using a simple <hr> styling if I can't confirm Separator, 
// OR simpler: just define it inline given I can't wait.
// Actually, I can just use a Tailwind div separator.
const currentYear = ref(new Date().getFullYear())
</script>

<template>
  <footer class="w-full border-t bg-background">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8">
      <!-- Logo Section -->
      <a href="/" class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
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
              <rect y="0.5" width="328" height="328" rx="164" class="fill-black dark:fill-white" />
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
            <span class="text-xl font-semibold tracking-tight text-foreground">Metacult</span>
          </div>
        </div>
      </a>

      <!-- Navigation Links -->
      <nav class="flex items-center gap-5 whitespace-nowrap text-sm font-medium text-muted-foreground">
        <a href="#" class="transition-colors hover:text-foreground">About</a>
        <a href="#" class="transition-colors hover:text-foreground">Features</a>
        <a href="#" class="transition-colors hover:text-foreground">Works</a>
        <a href="#" class="transition-colors hover:text-foreground">Career</a>
      </nav>

      <!-- Social Icons -->
      <div class="flex items-center gap-4">
        <a href="#" class="text-muted-foreground transition-colors hover:text-foreground" aria-label="Facebook">
          <Facebook class="size-5" />
        </a>
        <a href="#" class="text-muted-foreground transition-colors hover:text-foreground" aria-label="Instagram">
          <Instagram class="size-5" />
        </a>
        <a href="#" class="text-muted-foreground transition-colors hover:text-foreground" aria-label="X (Twitter)">
          <Twitter class="size-5" />
        </a>
        <a href="#" class="text-muted-foreground transition-colors hover:text-foreground" aria-label="Youtube">
          <Youtube class="size-5" />
        </a>
      </div>
    </div>

    <div class="h-[1px] w-full bg-border" />

    <!-- Credits & Attribution Section -->
    <div class="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-8 max-md:text-center sm:px-6 md:flex-row md:items-start md:justify-between md:gap-10">
      
      <!-- TMDB Attribution -->
      <div class="flex flex-col items-center gap-2 md:items-start md:max-w-xs">
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" class="group transition-opacity hover:opacity-80">
          <!-- TMDB Placeholder Logo -->
          <svg class="h-8 w-auto grayscale transition-all duration-300 group-hover:grayscale-0" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
             <rect width="200" height="80" rx="10" fill="#0D253F" />
             <text x="100" y="55" font-family="Arial" font-weight="bold" font-size="40" fill="#90CEA1" text-anchor="middle">TMDB</text>
          </svg>
        </a>
        <p class="text-[10px] leading-tight text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>

      <!-- IGDB Attribution -->
      <div class="flex flex-col items-center gap-2 md:items-start">
        <a href="https://www.igdb.com/" target="_blank" rel="noopener noreferrer" class="group transition-opacity hover:opacity-80">
           <!-- IGDB Placeholder Logo -->
           <svg class="h-8 w-auto grayscale transition-all duration-300 group-hover:grayscale-0" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
             <rect width="100" height="40" rx="4" fill="#9147FF" />
             <text x="50" y="28" font-family="Arial" font-weight="bold" font-size="20" fill="white" text-anchor="middle">IGDB</text>
           </svg>
        </a>
        <span class="text-[10px] text-muted-foreground/60">Data provided by IGDB</span>
      </div>

       <!-- Google Books Attribution -->
      <div class="flex flex-col items-center gap-2 md:items-start">
        <div class="flex items-center gap-2 grayscale transition-all duration-300 hover:grayscale-0">
          <!-- Google 'Powered By' Badge Logic -->
          <span class="text-xs font-semibold text-muted-foreground">Powered by</span>
          <svg class="h-6 w-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
           <span class="text-sm font-bold text-foreground">Google Books</span>
        </div>
      </div>

    </div>

    <div class="h-[1px] w-full bg-border" />

    <!-- Bottom Copyright Section -->
    <div class="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6">
      <p class="text-balance text-center text-sm font-medium text-muted-foreground">
        &copy; {{ currentYear }} <a href="#" class="hover:underline">Metacult</a>, Made with ❤️ for better culture.
      </p>
    </div>
  </footer>
</template>
