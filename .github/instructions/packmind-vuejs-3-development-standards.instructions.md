---
applyTo: '**'
---
## Standard: VueJS 3 Development Standards

Standard global pour le développement Vue.js 3 avec Composition API et TypeScript. :
* Adhere to the single responsibility principle: keep components small and focused on one concern.
* Avoid using v-html to prevent Cross-Site Scripting (XSS); sanitize inputs if HTML rendering is necessary.
* Enable strict mode in tsconfig.json and use TypeScript with <script setup lang="ts"> for maximum type safety.
* Extract reusable logic into composable functions in a composables/ directory.
* Favor the Composition API (setup functions and composables) over the Options API for better logic organization and reuse.
* Handle loading, error, and success states explicitly when fetching data.
* Lazy-load components with dynamic imports and defineAsyncComponent to optimize initial bundle size.
* Use <style scoped> or CSS Modules to prevent style leakage between components.
* Use PascalCase for component names and kebab-case for file names (e.g., MyComponent.vue).
* Use Pinia for global state management and ref/reactive for local state within components.
* Use semantic HTML elements and ARIA attributes to ensure WCAG compliance.

Full standard is available here for further request: [VueJS 3 Development Standards](../../.packmind/standards/vuejs-3-development-standards.md)