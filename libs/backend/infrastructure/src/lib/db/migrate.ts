import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDbConnection } from './client';
import path from 'path';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

async function runMigrations() {
    console.log('📦 Running Database Migrations...');

    // Assuming process.cwd() is the project root in Docker (/usr/src/app)
    // Or local project root
    const migrationsFolder = path.join(process.cwd(), 'drizzle');
    console.log(`🔹 Migrations folder: ${migrationsFolder}`);

    for (let i = 1; i <= MAX_RETRIES; i++) {
        try {
            console.log(`🔌 Connecting to Database (Attempt ${i}/${MAX_RETRIES})...`);
            const { db } = getDbConnection();

            // Test connection first
            await db.execute('SELECT 1');

            await migrate(db, { migrationsFolder });

            console.log('✅ Migrations applied successfully!');
            process.exit(0);
        } catch (error: any) {
            console.error(`❌ Migration attempt ${i} failed:`, error.message);
            if (i < MAX_RETRIES) {
                console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
            } else {
                console.error('💥 All migration attempts failed. Exiting.');
                process.exit(1);
            }
        }
    }
}

runMigrations();
