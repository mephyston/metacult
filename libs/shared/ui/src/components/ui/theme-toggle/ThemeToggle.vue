<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
import { Moon, Sun } from 'lucide-vue-next';
import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});
const toggleDark = useToggle(isDark);

const themes = [
  { name: 'Claude', value: 'claude' },

  { name: 'Material', value: 'material' },
  { name: 'Marvel', value: 'marvel' },
  { name: 'Spotify', value: 'spotify' },
  { name: 'Vercel', value: 'vercel' },
];

const isOpen = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

// Handle Hover with Delay to prevent flickering
const onMouseEnter = () => {
  if (timer) clearTimeout(timer);
  isOpen.value = true;
};

const onMouseLeave = () => {
  timer = setTimeout(() => {
    isOpen.value = false;
  }, 300);
};

const setTheme = (theme: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-color', theme);
  }
  // Close menu after selection
  isOpen.value = false;
};
</script>

<template>
  <div class="relative inline-block" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <DropdownMenu :open="isOpen" :modal="false">
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon" @click="toggleDark()">
          <!-- Sun Icon: Visible in Light Mode. Ensure contrast if needed. -->
          <Sun
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground dark:text-foreground" />
          <Moon
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground dark:text-foreground" />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent :side-offset="0" align="end" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="h-full w-full" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
          <DropdownMenuItem v-for="theme in themes" :key="theme.value" @click="setTheme(theme.value)">
            {{ theme.name }}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
