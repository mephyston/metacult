// ===== DOMAIN (Public API) =====
export * from './domain/entities/media.entity';
export * from './domain/value-objects/media-id.vo';
export * from './domain/value-objects/rating.vo';
export * from './domain/value-objects/cover-url.vo';
export * from './domain/value-objects/release-year.vo';
export * from './domain/value-objects/external-reference.vo';
export * from './domain/errors/catalog.errors';
export { MediaImportPolicy } from './domain/services/media-import.policy';

// ===== APPLICATION (Public API) =====
export * from './application/ports/media.repository.interface';
export * from './application/ports/media-provider.interface';
export * from './application/queries/search-media/search-media.query';
export * from './application/queries/search-media/search-media.handler';
export * from './application/commands/import-media/import-media.command';
export * from './application/commands/import-media/import-media.handler';

// ===== INFRASTRUCTURE (Configuration & Initialization) =====
export * as mediaSchema from './infrastructure/db/media.schema';
export { DrizzleMediaRepository } from './infrastructure/repositories/drizzle-media.repository';
export * from './infrastructure/providers/tmdb.provider';
export * from './infrastructure/providers/igdb.provider';
export * from './infrastructure/providers/google-books.provider';
export * from './infrastructure/factories/catalog.factory';
export type { CatalogModuleConfig } from './infrastructure/factories/catalog.factory';

// ===== API (Presentation Layer) =====
export * from './api/routes';
export { MediaController } from './api/http/controllers/media.controller';
