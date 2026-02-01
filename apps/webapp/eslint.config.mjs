import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: [
      '.nuxt',
      '.output',
      'dist',
      'node_modules',
      '**/.nuxt/**',
      '**/.output/**',
      '**/node_modules/**',
      '**/dist/**'
    ],
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
    rules: {},
  }
];
