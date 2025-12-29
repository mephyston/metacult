export * from './domain/entities/media.entity';
export * from './domain/value-objects/rating.vo';
export * from './domain/value-objects/cover-url.vo';
export * from './domain/value-objects/release-year.vo';
export * from './application/queries/search-media/search-media.query';
export * from './application/queries/search-media/search-media.handler';
export * from './application/commands/import-media/import-media.command';
export * from './application/commands/import-media/import-media.handler';
export * from './infrastructure/repositories/drizzle-media.repository';
export * from './infrastructure/providers/igdb.provider';
export * from './infrastructure/providers/tmdb.provider';
export * from './infrastructure/providers/google-books.provider';
export * from './infrastructure/adapters/media.adapters';
export * from './api/routes'; // Export Elysia routes
export * as mediaSchema from './infrastructure/db/media.schema';
