import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour tests E2E Metacult
 * 
 * Les serveurs doivent être lancés manuellement avant les tests:
 * - Website (Astro): bunx nx run website:dev (localhost:4321 par défaut, peut varier)
 * - Webapp (Nuxt): bunx nx run webapp:dev (localhost:4201)
 * - API (ElysiaJS): bunx nx run api:dev (localhost:3000)
 * 
 * Ou utiliser docker-compose pour tout lancer d'un coup.
 */
export default defineConfig({
  testDir: './tests',
  
  // Pattern pour les fichiers de test E2E
  testMatch: '**/*.e2e.ts',
  
  // Timeout global pour chaque test
  timeout: 60_000,
  
  // Nombre de tentatives en cas d'échec
  retries: process.env.CI ? 2 : 0,
  
  // Nombre de workers parallèles
  workers: process.env.CI ? 1 : undefined,

  // Reporter pour les résultats
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Configuration globale des tests
  use: {
    // Base URL pour la navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4444',
    
    // Prendre des screenshots uniquement en cas d'échec
    screenshot: 'only-on-failure',
    
    // Enregistrer les traces pour débogage
    trace: 'retain-on-failure',
    
    // Timeout pour les actions (click, fill, etc.)
    actionTimeout: 10_000,
  },

  // Configuration des projets (navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Décommenter pour tester sur d'autres navigateurs
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Serveur web local (optionnel - si vous voulez que Playwright lance les serveurs)
  // Pour l'instant, on assume que les serveurs tournent déjà
  // webServer: [
  //   {
  //     command: 'bun run --filter=website dev',
  //     url: 'http://localhost:4321',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120_000,
  //   },
  //   {
  //     command: 'bun run --filter=webapp dev',
  //     url: 'http://localhost:4200',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120_000,
  //   },
  //   {
  //     command: 'bun run --filter=api dev',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120_000,
  //   },
  // ],
});
