// noinspection JSDeprecatedSymbols
import { z } from 'zod';
import { logger } from '@metacult/shared-core';

// 1. Définition du Schema Strict avec Zod
const envSchema = z.object({
  // Infrastructure
  API_PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  // Auth & Security
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  AUTH_COOKIE_PREFIX: z.string().default('metacult'),
  ROOT_DOMAIN: z.string().optional(),

  // Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Internal / Public URLs
  INTERNAL_API_URL: z.string().url().optional(),
  PUBLIC_API_URL: z.string().url().optional(),
  PUBLIC_WEBSITE_URL: z.string().url().optional(),
  PUBLIC_WEBAPP_URL: z.string().url().optional(),

  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'staging', 'test'])
    .default('development'),

  // External API Keys
  IGDB_CLIENT_ID: z.string().optional(),
  IGDB_CLIENT_SECRET: z.string().optional(),
  TMDB_API_KEY: z.string().optional(),
  GOOGLE_BOOKS_API_KEY: z.string().optional(),

  // Affiliate
  INSTANT_GAMING_REF: z.string().optional(),
  AMAZON_TAG: z.string().optional(),

  // Debug & Dev Tools
  DEBUG_SQL: z
    .preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return val;
    }, z.boolean())
    .default(false),
  DB_SSL: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        if (val === 'true') return true;
        if (val === 'false') return false;
      }
      return val;
    }, z.boolean().optional())
    .optional(),
  MIGRATIONS_FOLDER: z.string().optional(),
});

// noinspection JSDeprecatedSymbols
export type EnvType = z.infer<typeof envSchema>;

export class ConfigurationService {
  private static instance: ConfigurationService;
  private readonly config: EnvType;

  private constructor() {
    // 2. Validation Fail-Fast au démarrage
    const rawEnv = { ...process.env };

    // Compatibilité Railway: PORT -> API_PORT
    if (!rawEnv['API_PORT'] && rawEnv['PORT']) {
      rawEnv['API_PORT'] = rawEnv['PORT'];
    }

    // Compatibilité Railway: RAILWAY_ENVIRONMENT_NAME -> NODE_ENV
    if (rawEnv['RAILWAY_ENVIRONMENT_NAME']) {
      const railwayEnv = rawEnv['RAILWAY_ENVIRONMENT_NAME'].toLowerCase();
      if (['staging', 'production', 'development'].includes(railwayEnv)) {
        rawEnv['NODE_ENV'] = railwayEnv;
      }
    }

    const result = envSchema.safeParse(rawEnv);

    if (!result.success) {
      logger.fatal(
        { err: result.error.format() },
        '❌ Invalid Environment Configuration',
      );
      process.exit(1);
    }

    this.config = result.data;
    logger.info('✅ Configuration Loaded & Validated');
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  // --- TYPED GETTERS ---

  // Infrastructure
  public get apiPort(): number {
    return this.config.API_PORT;
  }

  public get databaseUrl(): string {
    return this.config.DATABASE_URL;
  }

  public get redisUrl(): string {
    return this.config.REDIS_URL;
  }

  // Auth
  public get betterAuthSecret(): string | undefined {
    return this.config.BETTER_AUTH_SECRET;
  }

  public get betterAuthUrl(): string | undefined {
    return this.config.BETTER_AUTH_URL;
  }

  public get betterAuthTrustedOrigins(): string[] {
    return this.config.BETTER_AUTH_TRUSTED_ORIGINS
      ? this.config.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((o) => o.trim())
      : [];
  }

  public get authCookiePrefix(): string {
    return this.config.AUTH_COOKIE_PREFIX;
  }

  public get rootDomain(): string | undefined {
    return this.config.ROOT_DOMAIN;
  }

  // URLs
  public get internalApiUrl(): string | undefined {
    return this.config.INTERNAL_API_URL;
  }

  public get publicApiUrl(): string | undefined {
    return this.config.PUBLIC_API_URL;
  }

  public get publicWebsiteUrl(): string | undefined {
    return this.config.PUBLIC_WEBSITE_URL;
  }

  public get publicWebappUrl(): string | undefined {
    return this.config.PUBLIC_WEBAPP_URL;
  }

  // Environment Checks
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
    return (
      this.config.NODE_ENV === 'test' || this.config.NODE_ENV === 'staging'
    );
  }

  // Config Flags
  public get debugSql(): boolean {
    return this.config.DEBUG_SQL;
  }

  public get dbSsl(): boolean | undefined {
    return this.config.DB_SSL;
  }

  public get migrationsFolder(): string | undefined {
    return this.config.MIGRATIONS_FOLDER;
  }

  // Affiliate
  public get instantGamingRef(): string | undefined {
    return this.config.INSTANT_GAMING_REF;
  }

  public get amazonTag(): string | undefined {
    return this.config.AMAZON_TAG;
  }

  // Generic Getter (Deprecated - prefer typed getters)
  public get<K extends keyof EnvType>(key: K): EnvType[K] {
    return this.config[key];
  }
}

// Export singleton instance for ease of use
export const configService = ConfigurationService.getInstance();
