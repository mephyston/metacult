<script setup lang="ts">
import Search from './Search.vue';
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 max-w-screen-2xl items-center">
      <div class="mr-4 hidden md:flex">
        <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
          <span class="hidden font-bold sm:inline-block">
            Metacult
          </span>
        </NuxtLink>
        <nav class="flex items-center gap-6 text-sm">
          <NuxtLink to="/docs" class="transition-colors hover:text-foreground/80 text-foreground/60">Docs</NuxtLink>
          <NuxtLink to="/components" class="transition-colors hover:text-foreground/80 text-foreground/60">Components</NuxtLink>
          <NuxtLink to="/themes" class="transition-colors hover:text-foreground/80 text-foreground/60">Themes</NuxtLink>
          <NuxtLink to="/examples" class="transition-colors hover:text-foreground/80 text-foreground/60">Examples</NuxtLink>
        </nav>
      </div>
      
      <!-- Mobile Menu placeholder -->
      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
           <Search />
        </div>
        <nav class="flex items-center">
            <!-- Github/Twitter icons would go here -->
        </nav>
      </div>
    </div>
  </header>
</template>
