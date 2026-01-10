// ===== DOMAIN (Public API) =====
export * from './domain/entities/media.entity';
export * from './domain/value-objects/media-id.vo';
export * from './domain/value-objects/rating.vo';
export * from './domain/value-objects/cover-url.vo';
export * from './domain/value-objects/release-year.vo';
export * from './domain/value-objects/external-reference.vo';

// ===== DOMAIN ERRORS (Public API) =====
export * from './domain/errors/catalog.errors';

// ===== DOMAIN SERVICES (Public API) =====
export { MediaImportPolicy } from './domain/services/media-import.policy';

// ===== INFRASTRUCTURE PROVIDERS (For Worker) =====
export * from './infrastructure/providers/tmdb.provider';
export * from './infrastructure/providers/igdb.provider';
export * from './infrastructure/providers/google-books.provider';

// ===== APPLICATION (Public API) =====
export * from './application/queries/search-media/search-media.query';
export * from './application/queries/search-media/search-media.handler';
export * from './application/commands/import-media/import-media.command';
export * from './application/commands/import-media/import-media.handler';
export * from './application/factories/catalog.factory'; // ✅ Preferred way to get dependencies
export type { CatalogModuleConfig } from './application/factories/catalog.factory'; // Export config type

// ===== APPLICATION PORTS (Interfaces) =====
export * from './application/ports/media.repository.interface';
export * from './application/ports/media-provider.interface';

// ===== API (Elysia Routes) =====
export * from './api/routes';
export { MediaController } from './api/http/controllers/media.controller';

// ===== INFRASTRUCTURE (Limited Exports) =====
// ⚠️ Schema exported for DB initialization only (composition root)
export * as mediaSchema from './infrastructure/db/media.schema';

// Export Repository for DI in other modules (Ranking needs it)
export { DrizzleMediaRepository } from './infrastructure/repositories/drizzle-media.repository';

// ❌ Other implementations are INTERNAL. Use CatalogModuleFactory when possible.
// DO NOT export: IgdbProvider, mappers, validators, etc.
