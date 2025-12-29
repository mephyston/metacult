
import { importQueue } from '../queue/queue.client';

async function main() {
    console.log('🌱 Sending Seed Jobs to Queue...');

    // Real IDs from providers for "Seeding"
    const seeds = [
        { type: 'game' as const, id: '7346' }, // BOTW
        { type: 'game' as const, id: '119133' }, // Elden Ring
        { type: 'movie' as const, id: '603' }, // The Matrix
        { type: 'movie' as const, id: '27205' }, // Inception
        { type: 'tv' as const, id: '1396' }, // Breaking Bad
        { type: 'book' as const, id: 'wrOQLV6xB-wC' }, // The Way of Kings
    ];

    for (const seed of seeds) {
        console.log(`🚀 Queuing ${seed.type}: ${seed.id}`);
        await importQueue.add(
            'seed-import',
            { type: seed.type, id: seed.id },
            {
                jobId: `${seed.type}-${seed.id}-seed`, // Use deterministic ID to avoid duplicates if re-run
                removeOnComplete: true
            }
        );
    }

    console.log('✅ Seed jobs queued! Ensure Worker is running to process them.');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
