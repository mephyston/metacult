import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDbConnection } from './client';
import path from 'path';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

/**
 * Exécute les migrations de base de données Drizzle.
 * Tente de se connecter avec des re-essais (utile pour attendre que la DB soit prête au démarrage).
 * En cas de succès, le process se termine avec exit(0) (Job d'init).
 */
async function runMigrations() {
    console.log('📦 Exécution des Migrations Base de Données...');

    // Assuming process.cwd() is the project root in Docker (/usr/src/app)
    // Or local project root
    const migrationsFolder = path.join(process.cwd(), 'libs/backend/infrastructure/drizzle');
    console.log(`🔹 Dossier de migrations : ${migrationsFolder}`);

    try {
        const fs = await import('fs/promises');
        const files = await fs.readdir(migrationsFolder);
        console.log('📂 Fichiers trouvés :', files);
    } catch (e: any) {
        console.error('⚠️ Impossible de lire le dossier migrations :', e.message);
    }

    for (let i = 1; i <= MAX_RETRIES; i++) {
        try {
            console.log(`🔌 Connexion à la DB (Tentative ${i}/${MAX_RETRIES})...`);
            const { db } = getDbConnection();

            // Test connection first
            await db.execute('SELECT 1');

            await migrate(db, { migrationsFolder });

            console.log('✅ Migrations appliquées avec succès !');
            process.exit(0);
        } catch (error: any) {
            console.error(`❌ Échec tentative de migration ${i} :`, error.message);
            if (i < MAX_RETRIES) {
                console.log(`⏳ Nouvel essai dans ${RETRY_DELAY_MS / 1000}s...`);
                await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
            } else {
                console.error('💥 Toutes les tentatives de migration ont échoué. Arrêt.');
                process.exit(1);
            }
        }
    }
}

runMigrations();
