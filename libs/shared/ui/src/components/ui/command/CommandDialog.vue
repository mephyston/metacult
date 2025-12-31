<script setup lang="ts">
import { useForwardPropsEmits } from 'radix-vue'
import type { DialogRootEmits, DialogRootProps, ComboboxRootProps } from 'radix-vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../dialog'
import Command from './Command.vue'

const props = defineProps<DialogRootProps & { filterFunction?: ComboboxRootProps['filterFunction'] }>()
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <Dialog v-bind="forwarded">
    <DialogContent class="overflow-hidden p-0 shadow-lg sm:rounded-xl">
      <DialogTitle class="sr-only">Command Menu</DialogTitle>
      <DialogDescription class="sr-only">
        Search for games, movies, shows, and books.
      </DialogDescription>
      <Command 
        :filter-function="filterFunction"
        class="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
      >
        <slot />
      </Command>
    </DialogContent>
  </Dialog>
</template>
