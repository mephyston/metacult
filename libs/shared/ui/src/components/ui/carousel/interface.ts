import type { UnwrapRef } from 'vue'

export type CarouselApi = any
export type CarouselEmits = (e: 'init-api', payload: CarouselApi) => void
export type CarouselOrientation = 'horizontal' | 'vertical'

export interface CarouselProps {
    opts?: any
    plugins?: any
    orientation?: CarouselOrientation
    setApi?: (api: CarouselApi) => void
}
