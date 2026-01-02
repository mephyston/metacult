// DB (Generic exports remain, Media schema moved, Auth moved to Identity)
export * from './lib/db/client';
// export * from './db/seed.ts'; 
// export * from './db/migrate.ts'; 

// Auth (Re-exported depuis @metacult/backend-identity pour compatibilité)
// DEPRECATED: Importer directement depuis @metacult/backend-identity
export { auth, type AuthClient } from '@metacult/backend-identity';

// Cache & Queue (Shared)
import { cacheService, CacheService } from './lib/cache/cache.service';
// IMPORTANT: This log is required to prevent tree-shaking/optimization issues with Bun test runner.
// Without it, cacheService export is undefined in consumer tests.
// console.log('✅ [Infrastructure Index] Exporting cacheService:', !!cacheService);
export { cacheService, CacheService };
// export * from './lib/cache/cache.service';
export * from './lib/redis/redis.client';
export * from './lib/queue/queue.client';
export * from './lib/context/request-context';
export * from './lib/logger/console-patch';
export * from './lib/db/migrate';
