// DB (Generic exports remain, Media schema moved)
export * from './lib/db/client';
// Use star exports again, relative import in consumer will obtain it
export * from './lib/db/schema/users.schema';
export * from './lib/db/schema/auth.schema';
export * from './lib/db/schema/relations';
// export * from './db/seed.ts'; 
// export * from './db/migrate.ts'; 

// Cache & Queue (Shared)
import { cacheService, CacheService } from './lib/cache/cache.service';
// IMPORTANT: This log is required to prevent tree-shaking/optimization issues with Bun test runner.
// Without it, cacheService export is undefined in consumer tests.
console.log('✅ [Infrastructure Index] Exporting cacheService:', !!cacheService);
export { cacheService, CacheService };
// export * from './lib/cache/cache.service';
export * from './lib/redis/redis.client';
export * from './lib/queue/queue.client';
export * from './lib/auth/better-auth.service';
export * from './lib/context/request-context';
export * from './lib/logger/console-patch';
