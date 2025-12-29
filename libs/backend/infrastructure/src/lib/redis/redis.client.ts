import Redis from 'ioredis';

const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';

console.log(`🔌 Initializing Redis Client for Cache...`);

// Singleton Redis Client
export const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        // Exponential backoff with max 2s delay
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redisClient.on('error', (err) => {
    // Silent error logs in production might be preferred to avoid noise if redis flaps, 
    // but for now we log errors to be aware.
    if (process.env.NODE_ENV !== 'test') {
        console.error('❌ Redis Client Error:', err.message);
    }
});

redisClient.on('connect', () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Redis Client Connected');
    }
});
