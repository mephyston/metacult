export * from './application/queries/get-mixed-feed/get-mixed-feed.query';
export * from './application/queries/get-mixed-feed/get-mixed-feed.handler';
export * from './api/routes';
export * from './api/http/controllers/feed.controller';
export * from './api/http/controllers/media.controller';
export * from './application/queries/get-mixed-feed/get-mixed-feed.handler';
// Domain
export * from './domain/entities/affinity.entity';
export * from './domain/entities/neighbor.entity';
export * from './domain/ports/affinity.repository.interface';
export * from './domain/ports/similarity.repository.interface';
export * from './domain/services/personal-affinity.service';
export * from './domain/services/similarity-calculator.service'; // Exported for use if needed

// Application
export * from './application/commands/update-affinity.command';
export * from './application/commands/update-affinity.handler';
export * from './application/services/compute-neighbors.service';
export * from './application/queries/get-personalized-feed/get-personalized-feed.query';
export * from './application/queries/get-personalized-feed/get-personalized-feed.handler';

// Infrastructure
export * from './infrastructure/repositories/drizzle-affinity.repository';
export * from './infrastructure/repositories/drizzle-similarity.repository';
export * from './infrastructure/repositories/drizzle-catalog.repository';
export * from './infrastructure/db/schema';

// Export Handlers for API Composition Root
export * from './application/queries/get-trending/get-trending.handler';
export * from './application/queries/get-trending/get-trending.query';
export * from './application/queries/get-hall-of-fame/get-hall-of-fame.handler';
export * from './application/queries/get-hall-of-fame/get-hall-of-fame.query';
export * from './application/queries/get-controversial/get-controversial.handler';
export * from './application/queries/get-controversial/get-controversial.query';
export * from './application/queries/get-upcoming/get-upcoming.handler';
export * from './application/queries/get-upcoming/get-upcoming.query';
export * from './application/queries/get-top-rated-by-year/get-top-rated-by-year.handler';
export * from './application/queries/get-top-rated-by-year/get-top-rated-by-year.query';

// Constants
export const COMPUTE_NEIGHBORS_QUEUE_NAME = 'compute-neighbors';
