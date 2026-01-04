import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

// 1. Définition du Schema Strict
const EnvSchema = Type.Object({
  // Infrastructure
  API_PORT: Type.Number({ default: 3000 }),
  DATABASE_URL: Type.String(), // ex: postgres://...
  REDIS_URL: Type.String(), // ex: redis://...

  // Auth & Security
  BETTER_AUTH_SECRET: Type.String(),
  BETTER_AUTH_URL: Type.String(), // URL publique de l'API Auth
  BETTER_AUTH_TRUSTED_ORIGINS: Type.Optional(Type.String()), // Comma separated
  AUTH_COOKIE_PREFIX: Type.Optional(Type.String({ default: 'metacult' })),
  ROOT_DOMAIN: Type.Optional(Type.String()), // Pour partage cookies cross-subdomain (.metacult.gg)

  // Providers (Optional - uniquement si OAuth configuré)
  GOOGLE_CLIENT_ID: Type.Optional(Type.String()),
  GOOGLE_CLIENT_SECRET: Type.Optional(Type.String()),

  // Internal / Public URLs (Clean Architecture Split)
  INTERNAL_API_URL: Type.Optional(Type.String()), // Service-to-Service (Railway Internal)
  PUBLIC_API_URL: Type.String(), // Client-facing (Browser)
  PUBLIC_WEBSITE_URL: Type.Optional(Type.String()), // Website (Astro)

  // Environment
  NODE_ENV: Type.Union(
    [
      Type.Literal('development'),
      Type.Literal('production'),
      Type.Literal('staging'),
      Type.Literal('test'),
    ],
    { default: 'development' },
  ),

  // External API Keys (optional pour permettre démarrage si non utilisés)
  IGDB_CLIENT_ID: Type.Optional(Type.String()),
  IGDB_CLIENT_SECRET: Type.Optional(Type.String()),
  TMDB_API_KEY: Type.Optional(Type.String()),
  GOOGLE_BOOKS_API_KEY: Type.Optional(Type.String()),

  // Debug & Dev Tools
  DEBUG_SQL: Type.Optional(Type.Boolean({ default: false })),
  DB_SSL: Type.Optional(Type.Boolean()), // Force SSL on/off si défini
});

export type EnvType = Static<typeof EnvSchema>;

export class ConfigurationService {
  private static instance: ConfigurationService;
  private readonly config: EnvType;

  private constructor() {
    // 2. Validation Fail-Fast au démarrage
    const rawEnv = { ...process.env };
    // Railway provides PORT, map it to API_PORT if not explicit
    if (!rawEnv.API_PORT && rawEnv.PORT) {
      rawEnv.API_PORT = rawEnv.PORT;
    }

    // Auto-detect Railway Environment to force correct NODE_ENV
    if (rawEnv.RAILWAY_ENVIRONMENT_NAME) {
      const railwayEnv = rawEnv.RAILWAY_ENVIRONMENT_NAME.toLowerCase();
      if (['staging', 'production', 'development'].includes(railwayEnv)) {
        rawEnv.NODE_ENV = railwayEnv;
      }
    }

    // Apply defaults and convert types
    const withDefaults = Value.Default(EnvSchema, { ...rawEnv });
    const convertedEnv = Value.Convert(EnvSchema, withDefaults);

    if (!Value.Check(EnvSchema, convertedEnv)) {
      const errors = [...Value.Errors(EnvSchema, convertedEnv)];
      console.error('❌ Invalid Configuration:', errors);
      process.exit(1);
    }

    this.config = convertedEnv;
    console.log('✅ Configuration Loaded & Validated');
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  public get<K extends keyof EnvType>(key: K): EnvType[K] {
    return this.config[key];
  }

  public get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public get isStaging(): boolean {
    return this.config.NODE_ENV === 'staging';
  }

  public get isTest(): boolean {
    // Permet de tester avec NODE_ENV=staging en considérant staging comme test
    return this.config.NODE_ENV === 'staging';
  }
}

// Export singleton instance for ease of use
export const configService = ConfigurationService.getInstance();
