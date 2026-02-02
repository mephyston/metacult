// ===== SHARED INFRASTRUCTURE =====

// DB
export * from './lib/db/client';
export * from './lib/db/migrate';

// Cache & Queue
import { cacheService, CacheService } from './lib/cache/cache.service';
export { cacheService, CacheService };
export * from './lib/redis/redis.client';
export * from './lib/queue/queue.client';

// Context
export * from './lib/context/request-context';

// Logger
export { logger, LoggerService } from './lib/logger/logger.service';

// Configuration
export {
  configService,
  ConfigurationService,
} from './lib/config/configuration.service';
