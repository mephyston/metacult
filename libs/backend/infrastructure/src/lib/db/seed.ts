
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { DrizzleWorkRepository } from '../repositories/drizzle-work.repository';
import { WorkType } from '@metacult/backend/domain';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });
const repository = new DrizzleWorkRepository(db);

async function main() {
    console.log('🌱 Seeding database...');

    const works = [
        {
            id: uuidv4(),
            title: 'The Legend of Zelda: Breath of the Wild',
            type: WorkType.GAME,
            releaseDate: new Date('2017-03-03'),
            globalRating: 98,
            createdAt: new Date(),
            platform: ['Nintendo Switch', 'Wii U'],
            developer: 'Nintendo EPD',
            timeToBeat: 50,
        },
        {
            id: uuidv4(),
            title: 'The Matrix',
            type: WorkType.MOVIE,
            releaseDate: new Date('1999-03-31'),
            globalRating: 95,
            createdAt: new Date(),
            director: 'Lana & Lilly Wachowski',
            durationMinutes: 136,
        },
        {
            id: uuidv4(),
            title: 'Inception',
            type: WorkType.MOVIE,
            releaseDate: new Date('2010-07-16'),
            globalRating: 93,
            createdAt: new Date(),
            director: 'Christopher Nolan',
            durationMinutes: 148,
        },
        {
            id: uuidv4(),
            title: 'Elden Ring',
            type: WorkType.GAME,
            releaseDate: new Date('2022-02-25'),
            globalRating: 96,
            createdAt: new Date(),
            platform: ['PC', 'PS5', 'Xbox Series X'],
            developer: 'FromSoftware',
            timeToBeat: 60,
        },
    ];

    for (const work of works) {
        console.log(`Inserting ${work.type}: ${work.title}`);
        await repository.create(work as any); // Type assertion needed because Work interface vs Concrete types
    }

    console.log('✅ Seeding complete!');
    await pool.end();
}

main().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
