export * from './domain/entities/media.entity';
export * from './domain/value-objects/rating.vo';
export * from './domain/value-objects/cover-url.vo';
export * from './domain/value-objects/release-year.vo';
export * from './application/queries/search-media/search-media.query';
export * from './application/queries/search-media/search-media.handler';
export * from './application/commands/import-media/import-media.command';
export * from './application/commands/import-media/import-media.handler';
export * from './application/factories/catalog.factory'; // New Factory
export * from './api/routes'; // Export Elysia routes
export * as mediaSchema from './infrastructure/db/media.schema';

// Note: Infrastructure implementations (Repositories, Providers) are now encapsulated.
// Consumers must use CatalogModuleFactory or Dependency Injection.
