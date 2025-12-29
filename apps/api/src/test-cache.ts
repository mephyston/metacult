
import { cacheService } from '@metacult/backend/infrastructure';

// Example "Fetcher" function (simulating a DB or API call)
const getGameDetails = async (gameId: string) => {
    console.log(`🌐 Fetching game details for ID: ${gameId}... (Simulated API Call)`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
    return {
        id: gameId,
        name: "The Legend of Zelda: Breath of the Wild",
        rating: 97,
        releasedAt: new Date().toISOString()
    };
};

const main = async () => {
    console.log('🚀 Starting Cache Test...');
    const gameId = '12345';
    const cacheKey = `game:${gameId}`;

    // 1. First Call: Should MISS cache and execute fetcher
    console.log('\n--- Attempt 1 (Expect MISS) ---');
    const start1 = performance.now();
    const result1 = await cacheService.getOrSet(cacheKey, () => getGameDetails(gameId), 60);
    const end1 = performance.now();
    console.log('Result 1:', result1.name);
    console.log(`⏱️ Duration: ${(end1 - start1).toFixed(2)}ms`);

    // 2. Second Call: Should HIT cache (fast)
    console.log('\n--- Attempt 2 (Expect HIT) ---');
    const start2 = performance.now();
    const result2 = await cacheService.getOrSet(cacheKey, () => getGameDetails(gameId), 60);
    const end2 = performance.now();
    console.log('Result 2:', result2.name);
    console.log(`⏱️ Duration: ${(end2 - start2).toFixed(2)}ms`);

    // 3. Verify Data Equality
    if (result1.releasedAt === result2.releasedAt) {
        console.log('\n✅ Data integrity verified (Cache match)');
    } else {
        console.error('\n❌ Data mismatch!');
    }

    // Cleanup
    await cacheService.del(cacheKey);
    console.log('\n🧹 Test Key Cleaned up.');
    process.exit(0);
};

main();
