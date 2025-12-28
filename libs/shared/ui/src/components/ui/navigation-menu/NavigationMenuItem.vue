<script setup lang="ts">
import {
  NavigationMenuItem,
  type NavigationMenuItemProps,
  useForwardProps,
} from 'radix-vue'

const props = defineProps<NavigationMenuItemProps>()

const forwarded = useForwardProps(props)
</script>

<template>
  <NavigationMenuItem v-bind="forwarded">
    <slot />
  </NavigationMenuItem>
</template>
