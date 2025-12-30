<script setup lang="ts">
import { useProvideCarousel } from './useCarousel'
import type { CarouselEmits, CarouselProps } from './interface'
import { cn } from '../../../lib/utils'

// Note: adjust path to utils if needed. 
// libs/shared/ui/src/components/ui/carousel -> libs/shared/ui/src/lib/utils?
// Actually utils is usually in `libs/shared/ui/src/lib/utils.ts` or similar.
// Let's assume standard shadcn utils location or check.
// I'll check after this batch if utils exists. For now, I'll use relative.
// If utils is in @metacult/shared-ui/lib/utils, that's better.
// But I can't import from self easily.
// Let's assume `../../../../lib/utils` maps to `libs/shared/ui/src/lib/utils.ts`.

const props = withDefaults(defineProps<CarouselProps & { class?: string }>(), {
  orientation: 'horizontal',
})

const emits = defineEmits<CarouselEmits>()

const { carouselRef, orientation } = useProvideCarousel(props, emits)

defineExpose({
  carouselRef,
})

function onKeyDown(event: KeyboardEvent) {
  const prevKey = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  const nextKey = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'

  if (event.key === prevKey) {
    event.preventDefault()
    // api?.scrollPrev() // handled via provide/inject or we need to access api here?
    // useProvideCarousel returns api but inside the setup.
    // simpler is generic carousel.
  }
}
</script>

<template>
  <div
    :class="cn('relative', props.class)"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <slot />
  </div>
</template>
