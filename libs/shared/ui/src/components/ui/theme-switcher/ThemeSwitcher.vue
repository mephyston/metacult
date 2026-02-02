<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { Paintbrush } from 'lucide-vue-next';

const themes = [
  { name: 'Claude', value: 'claude' },
  { name: 'Zinc', value: 'zinc' },
];

const currentTheme = ref('claude');

onMounted(() => {
  if (typeof document !== 'undefined') {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme) {
      currentTheme.value = theme;
    }
  }
});

const setTheme = (theme: string) => {
  currentTheme.value = theme;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-color', theme);
  }
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
      >
        <Paintbrush class="h-[1.2rem] w-[1.2rem]" />
        <span class="sr-only">Toggle theme color</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="theme in themes"
        :key="theme.value"
        @click="setTheme(theme.value)"
      >
        {{ theme.name }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
