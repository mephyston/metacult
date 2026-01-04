import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['.nuxt', '.output', 'dist', 'node_modules', '**/.nuxt/**'],
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
    rules: {},
  }
];
