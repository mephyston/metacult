# VueJS 3 Development Standards

Ensemble complet de bonnes pratiques pour le développement d'applications Vue.js 3 modernes utilisant la Composition API, TypeScript et Pinia. Couvre l'architecture, le design des composants, la gestion d'état, la performance, la sécurité et l'accessibilité.

## Rules

* Favor the Composition API (setup functions and composables) over the Options API for better logic organization and reuse.
* Extract reusable logic into composable functions in a composables/ directory.
* Enable strict mode in tsconfig.json and use TypeScript with <script setup lang="ts"> for maximum type safety.
* Adhere to the single responsibility principle: keep components small and focused on one concern.
* Use PascalCase for component names and kebab-case for file names (e.g., MyComponent.vue).
* Use Pinia for global state management and ref/reactive for local state within components.
* Use <style scoped> or CSS Modules to prevent style leakage between components.
* Lazy-load components with dynamic imports and defineAsyncComponent to optimize initial bundle size.
* Handle loading, error, and success states explicitly when fetching data.
* Avoid using v-html to prevent Cross-Site Scripting (XSS); sanitize inputs if HTML rendering is necessary.
* Use semantic HTML elements and ARIA attributes to ensure WCAG compliance.
