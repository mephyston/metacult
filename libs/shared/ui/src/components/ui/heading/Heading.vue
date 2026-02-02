<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'default' | 'section' | 'page' | 'subtitle';
  color?: 'default' | 'primary' | 'white' | 'muted';
  align?: 'left' | 'center' | 'right';
  inverse?: boolean; // For dark backgrounds
}

const props = withDefaults(defineProps<Props>(), {
  level: 2,
  variant: 'default',
  color: 'default',
  align: 'left',
  inverse: false,
});

const componentTag = computed(() => props.element || `h${props.level}`);

const classes = computed(() => {
  const c = [];

  // Alignment
  c.push(`text-${props.align}`);

  // Color logic
  if (props.inverse) {
    c.push('text-white');
    if (props.color === 'muted') c.push('opacity-60');
  } else {
    switch (props.color) {
      case 'primary':
        c.push('text-primary');
        break;
      case 'muted':
        c.push('text-theme-text');
        break; // Match $text-color
      case 'white':
        c.push('text-white');
        break;
      default:
        c.push('text-theme-heading'); // Match h1-h6 color #4f4f4f
    }
  }

  // Typography Scale (matching theme)
  // h1: 36px ($font-family-base, 500)
  // h2: 30px
  // h3: 24px
  switch (props.level) {
    case 1:
      c.push('text-[36px] font-medium leading-tight mb-[10px]');
      break;
    case 2:
      c.push('text-[30px] font-medium leading-tight mb-[10px]');
      break;
    case 3:
      c.push('text-[24px] font-medium leading-snug mb-[10px]');
      break;
    case 4:
      c.push('text-[20px] font-medium leading-snug mb-[10px]');
      break;
    case 5:
      c.push('text-[17px] font-medium leading-normal mb-[10px]');
      break;
    default:
      c.push('text-[15px] font-medium leading-normal mb-[10px]');
  }

  // Variants
  if (props.variant === 'section') {
    // Intentionally kept minimal as theme section titles are often just h5
  }
  if (props.variant === 'subtitle') {
    c.push(
      'border-l-[3px] border-primary pl-[15px] uppercase font-bold mb-[20px] text-theme-heading',
    );
    // Subtitle overrides some default sizing usually, but we keep level sizing or force it?
    // Theme .subtitle doesn't specify size, implies inheriting or fixed?
    // Often used with p or div, but if used on h* it adds border.
  }

  return c.join(' ');
});
</script>

<template>
  <component
    :is="componentTag"
    :class="classes"
  >
    <slot />
    <!-- Optional subtitle slot behavior could go here or explicit slots -->
  </component>
</template>
