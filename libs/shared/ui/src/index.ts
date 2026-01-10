// Export Shadcn UI components (Primitives)
export * from './components/ui/button';
export * from './components/ui/card';
export * from './components/ui/input';
export * from './components/ui/label';
export * from './components/ui/badge';
export * from './components/ui/navigation-menu';
export * from './components/ui/heading';
export * from './components/ui/logo';
export * from './components/ui/text-rotator';
export * from './components/ui/tooltip';
export * from './components/ui/theme-toggle';
export * from './components/ui/theme-switcher';
export * from './lib/theme-script';
export * from './components/ui/command';
export * from './components/ui/dialog';
export * from './components/ui/select';
export * from './components/ui/slider';

// Export Layout components
export * from './components/layout';
export { default as Search } from './components/layout/Search.vue';

// Export Feature components
export { default as ReviewDeck } from './components/features/review/ReviewDeck.vue';
export { default as Hero } from './components/features/hero/Hero.vue';
export { default as SwipeCard } from './components/features/swipe/SwipeCard.vue';
export { default as SwipeDeck } from './components/features/swipe/SwipeDeck.vue';
export { default as VerifyGoldCard } from './lib/verify/VerifyGoldCard.vue';

// Export Utils
export * from './lib/utils';
