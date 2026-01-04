// DB (Generic exports remain, Media schema moved, Auth moved to Identity)
export * from './lib/db/client';

// Cache & Queue (Shared)
import { cacheService, CacheService } from './lib/cache/cache.service';
export { cacheService, CacheService };
export * from './lib/redis/redis.client';
export * from './lib/queue/queue.client';
export * from './lib/context/request-context';

// Logger
export { logger, LoggerService } from './lib/logger/logger.service';

// Configuration
export { configService, ConfigurationService } from './lib/config/configuration.service';

// Database migrations
export * from './lib/db/migrate';
