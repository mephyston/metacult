import nx from '@nx/eslint-plugin';

import pluginVue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/javascript'],
  ...pluginVue.configs['flat/base'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/vite.config.*.timestamp*',
      '**/*.d.ts',
      '**/.astro/**/*',
      '**/.nuxt/**/*',
      'apps/webapp/.nuxt/**/*',
      '**/.output/**/*',
      'apps/webapp/nuxt.config.ts',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/node_modules',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // === Clean Architecture Layer Constraints ===
            // Domain layer: Pure business logic, NO external dependencies
            {
              sourceTag: 'layer:domain',
              onlyDependOnLibsWithTags: ['layer:domain', 'scope:shared'],
            },
            // Application layer: Use Cases, can depend on Domain
            {
              sourceTag: 'layer:application',
              onlyDependOnLibsWithTags: [
                'layer:domain',
                'layer:application',
                'scope:shared',
              ],
            },
            // Infrastructure layer: Adapters, can depend on Domain and Application
            {
              sourceTag: 'layer:infrastructure',
              onlyDependOnLibsWithTags: [
                'layer:domain',
                'layer:application',
                'layer:infrastructure',
                'scope:shared',
              ],
            },
            // API layer: HTTP/Controllers, can depend on Application (Commands/Queries)
            {
              sourceTag: 'layer:api',
              onlyDependOnLibsWithTags: [
                'layer:application',
                'layer:api',
                'scope:shared',
              ],
            },

            // === Bounded Context Isolation ===
            // Catalog context: Cannot import Identity or Interaction directly
            {
              sourceTag: 'scope:catalog',
              onlyDependOnLibsWithTags: ['scope:catalog', 'scope:shared'],
              notDependOnLibsWithTags: ['scope:identity', 'scope:interaction'],
            },
            // Identity context: Cannot import Catalog or Interaction directly
            {
              sourceTag: 'scope:identity',
              onlyDependOnLibsWithTags: ['scope:identity', 'scope:shared'],
              notDependOnLibsWithTags: ['scope:catalog', 'scope:interaction'],
            },
            // Interaction context: Cannot import other bounded contexts
            {
              sourceTag: 'scope:interaction',
              onlyDependOnLibsWithTags: [
                'scope:interaction',
                'scope:shared',
                'scope:identity',
              ],
              notDependOnLibsWithTags: [
                'scope:catalog',
                'scope:discovery',
                'scope:marketing',
              ],
            },
            // Discovery context: Needs Catalog access for Media Metadata
            {
              sourceTag: 'scope:discovery',
              onlyDependOnLibsWithTags: [
                'scope:discovery',
                'scope:shared',
                'scope:catalog',
              ],
              notDependOnLibsWithTags: [
                'scope:identity',
                'scope:interaction',
                'scope:marketing',
              ],
            },
            // Marketing context: Cannot import other bounded contexts
            {
              sourceTag: 'scope:marketing',
              onlyDependOnLibsWithTags: ['scope:marketing', 'scope:shared'],
              notDependOnLibsWithTags: [
                'scope:catalog',
                'scope:identity',
                'scope:interaction',
                'scope:discovery',
              ],
            },

            // === Legacy constraints (to migrate) ===
            {
              sourceTag: 'layer:backend',
              onlyDependOnLibsWithTags: ['layer:backend', 'scope:shared'],
            },
            {
              sourceTag: 'layer:frontend',
              onlyDependOnLibsWithTags: ['layer:frontend', 'scope:shared'],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:util',
                'type:bounded-context',
                'type:domain',
              ],
            },
            {
              sourceTag: 'type:bounded-context',
              onlyDependOnLibsWithTags: [
                'type:bounded-context',
                'type:util',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:util', 'type:ui'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      // Discourage wildcard imports to enforce minimal, explicit imports
      // Use eslint-disable-next-line for legitimate cases like database schemas
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            'ImportDeclaration[source.value=/^@metacult/] ImportNamespaceSpecifier',
          message:
            'Avoid wildcard imports from @metacult modules. Import only what you need (e.g., import { Media, MediaType } from \'@metacult/backend-catalog\'). If you need to import a schema namespace (e.g., import * as mediaSchema), add // eslint-disable-next-line no-restricted-syntax above the import.',
        },
      ],
      // Prevent cross-module relative imports
      // Force usage of @metacult/* aliases for better encapsulation
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/libs/**', '**/apps/**'],
              message:
                'Do not import across module boundaries using relative paths. Use @metacult/* aliases instead (e.g., import { Media } from \'@metacult/backend-catalog\').',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/__tests__/**/*',
      '**/test/**/*',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];
