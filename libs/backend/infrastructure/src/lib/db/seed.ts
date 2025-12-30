
import { importQueue } from '../queue/queue.client';

async function main() {
    console.log('🌱 Envoi des Jobs de Seed à la Queue...');

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
        console.log(`🚀 Ajout en queue ${seed.type} : ${seed.id}`);
        await importQueue.add(
            'seed-import',
            { type: seed.type, id: seed.id },
            {
                jobId: `${seed.type}-${seed.id}-seed`, // Use deterministic ID to avoid duplicates if re-run
                removeOnComplete: true
            }
        );
    }

    console.log('✅ Jobs de Seed en file d\'attente ! Assurez-vous que le Worker tourne.');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Echec du Seeding :', err);
    process.exit(1);
});
