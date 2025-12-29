// Infrastructure Exports (Needed for Worker/Seeding)
// Infrastructure Types
export * from './infrastructure/db/media.schema';
export * from './infrastructure/db/interactions.schema';
export { mediasRelations } from './infrastructure/db/relations';

// Adapters
export * from './infrastructure/adapters/media.adapters';
// API
export * from './infrastructure/api/media.routes';
// export * from './infrastructure/adapters/mappers'; // Not explicitly needed if adapters abstract it

// Repositories
export * from './infrastructure/repositories/drizzle-media.repository';

// Providers
export * from './infrastructure/providers/igdb.provider';
export * from './infrastructure/providers/tmdb.provider';
export * from './infrastructure/providers/google-books.provider';

// Application (CQRS)
export * from './application/commands/import-media/import-media.command';
export * from './application/commands/import-media/import-media.handler';
export * from './application/queries/search-media/search-media.query';
export * from './application/queries/search-media/search-media.handler';
export * from './application/ports/media.repository.interface';
export * from './application/ports/media-provider.interface';

// Domain
export * from './domain/entities/media.entity';
