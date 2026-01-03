import { Type, type Static, type TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

// 1. Définition du Schema Strict
const EnvSchema = Type.Object({
  // Infrastructure
  API_PORT: Type.Number({ default: 3000 }),
  DATABASE_URL: Type.String({ format: 'uri' }), // ex: postgres://...
  REDIS_URL: Type.String({ format: 'uri' }), // ex: redis://...

  // Auth & Security
  BETTER_AUTH_SECRET: Type.String(),
  BETTER_AUTH_URL: Type.String({ format: 'uri' }), // URL publique de l'API Auth
  BETTER_AUTH_TRUSTED_ORIGINS: Type.Optional(Type.String()), // Comma separated
  AUTH_COOKIE_PREFIX: Type.Optional(Type.String({ default: 'metacult' })),
  ROOT_DOMAIN: Type.Optional(Type.String()), // Pour partage cookies cross-subdomain (.metacult.gg)

  // Providers (Optional - uniquement si OAuth configuré)
  GOOGLE_CLIENT_ID: Type.Optional(Type.String()),
  GOOGLE_CLIENT_SECRET: Type.Optional(Type.String()),

  // Internal / Public URLs (Clean Architecture Split)
  INTERNAL_API_URL: Type.Optional(Type.String()), // Service-to-Service (Railway Internal)
  PUBLIC_API_URL: Type.String({ format: 'uri' }), // Client-facing (Browser)
  PUBLIC_WEBSITE_URL: Type.Optional(Type.String({ format: 'uri' })), // Website (Astro)

  // Environment
  NODE_ENV: Type.Union(
    [
      Type.Literal('development'),
      Type.Literal('production'),
      Type.Literal('staging'),
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
    const rawEnv = process.env;

    // Conversion des types (ex: "3000" -> 3000)
    const convertedEnv = Value.Convert(EnvSchema, rawEnv);

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
