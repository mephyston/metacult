import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import * as schema from '../libs/backend/catalog/src/infrastructure/db/media.schema';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/metacult',
});

const db = drizzle(pool, { schema });

async function seed() {
    console.log('🌱 Seeding Hero Data...');

    const medias = [
        {
            title: 'Arcane',
            type: 'TV',
            releaseDate: new Date('2021-11-06'),
            globalRating: 9.8,
            providerMetadata: {
                coverUrl: 'https://image.tmdb.org/t/p/w500/fqldf2t8ftq9718izkj1bxbkmoj.jpg'
            },
            tags: ['Animation', 'Sci-Fi', 'Drama']
        },
        {
            title: 'Dune: Part Two',
            type: 'MOVIE',
            releaseDate: new Date('2024-02-28'),
            globalRating: 9.2,
            providerMetadata: {
                coverUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'
            },
            tags: ['Sci-Fi', 'Adventure']
        },
        {
            title: 'Elden Ring',
            type: 'GAME',
            releaseDate: new Date('2022-02-25'),
            globalRating: 9.7,
            providerMetadata: {
                coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg'
            },
            tags: ['RPG', 'Open World', 'Fantasy']
        },
        {
            title: 'Solo Leveling',
            type: 'BOOK',
            releaseDate: new Date('2016-07-25'),
            globalRating: 9.5,
            providerMetadata: {
                coverUrl: 'https://m.media-amazon.com/images/I/71s+U9k2JBL._AC_UF1000,1000_QL80_.jpg'
            },
            tags: ['Manga', 'Action', 'Fantasy']
        },
        {
            title: 'Cyberpunk 2077',
            type: 'GAME',
            releaseDate: new Date('2020-12-10'),
            globalRating: 8.5,
            providerMetadata: {
                coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mjs.jpg'
            },
            tags: ['RPG', 'Sci-Fi']
        }
    ];

    for (const m of medias) {
        const id = uuidv4();
        console.log(`Inserting ${m.title}...`);

        await db.insert(schema.medias).values({
            id,
            title: m.title,
            type: m.type as any,
            releaseDate: m.releaseDate,
            globalRating: m.globalRating,
            providerMetadata: m.providerMetadata as any,
            createdAt: new Date() // Now
        }).onConflictDoNothing();

        // Need to insert into subtypes to respect constraint
        if (m.type === 'TV') {
            await db.insert(schema.tv).values({ id, creator: 'Riot Games', episodesCount: 9, seasonsCount: 2 }).onConflictDoNothing();
        } else if (m.type === 'MOVIE') {
            await db.insert(schema.movies).values({ id, director: 'Denis Villeneuve', durationMinutes: 166 }).onConflictDoNothing();
        } else if (m.type === 'GAME') {
            await db.insert(schema.games).values({ id, developer: 'FromSoftware', platform: ['PC', 'PS5'], timeToBeat: 60 }).onConflictDoNothing();
        } else if (m.type === 'BOOK') {
            await db.insert(schema.books).values({ id, author: 'Chugong', pages: 300 }).onConflictDoNothing();
        }

        // Insert Tags
        for (const t of m.tags) {
            // Check if tag exists
            let tagId;
            const existing = await db.select().from(schema.tags).where(eq(schema.tags.label, t)).limit(1);
            if (existing.length > 0 && existing[0]) {
                tagId = existing[0].id;
            } else {
                tagId = uuidv4();
                await db.insert(schema.tags).values({
                    id: tagId,
                    label: t,
                    slug: t.toLowerCase().replace(/ /g, '-'),
                    category: 'GENRE'
                });
            }
            // Link
            await db.insert(schema.mediasToTags).values({
                mediaId: id,
                tagId: tagId
            }).onConflictDoNothing();
        }
    }

    console.log('✅ Seed Complete!');
    process.exit(0);
}

seed().catch(console.error);
