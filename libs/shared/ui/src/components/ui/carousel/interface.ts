// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CarouselApi = any;
export type CarouselEmits = (e: 'init-api', payload: CarouselApi) => void;
export type CarouselOrientation = 'horizontal' | 'vertical';

export interface CarouselProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opts?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: any[];
  orientation?: CarouselOrientation;
  setApi?: (api: CarouselApi) => void;
}
