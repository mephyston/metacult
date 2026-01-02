
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDbConnection } from './client';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from 'drizzle-orm';

const LOCK_ID = 8675309; // Use a constant arbitrary integer for the advisory lock
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

async function runSafeMigrations() {
    console.log('🛡️  Initialisation des Migrations Sécurisées (Production Mode)...');

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const migrationsFolder = process.env.MIGRATIONS_FOLDER || path.resolve(__dirname, '../../../drizzle');

    for (let i = 1; i <= MAX_RETRIES; i++) {
        try {
            const { db } = getDbConnection();

            // 1. Connection check
            await db.execute('SELECT 1');

            console.log(`🔒 Tentative d'acquisition du verrou global (ID: ${LOCK_ID})...`);

            // 2. Transactional Migration with Advisory Lock
            await db.transaction(async (tx) => {
                // Acquire lock immediately. If another job is running, this waits.
                // pg_advisory_xact_lock releases automatically at end of transaction.
                await tx.execute(sql`SELECT pg_advisory_xact_lock(${LOCK_ID})`);

                console.log('🔓 Verrou acquis. Démarrage de la migration...');

                // Run Drizzle migrations
                await migrate(tx, { migrationsFolder });
            });

            console.log('✅ Migrations terminées avec succès (Verrou relâché).');
            process.exit(0);

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`❌ Erreur (Tentative ${i}/${MAX_RETRIES}) :`, message);

            if (i < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
            } else {
                console.error('💥 Abandon après échecs répétés.');
                process.exit(1);
            }
        }
    }
}

if (import.meta.main) {
    runSafeMigrations();
}
