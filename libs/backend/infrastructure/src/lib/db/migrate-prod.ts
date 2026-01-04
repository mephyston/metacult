import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDbConnection } from './client';
import { logger } from '../logger/logger.service';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql } from 'drizzle-orm';

const LOCK_ID = 8675309; // Use a constant arbitrary integer for the advisory lock
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

async function runSafeMigrations() {
  logger.info(
    '🛡️  Initialisation des Migrations Sécurisées (Production Mode)...',
  );

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER ||
    path.resolve(__dirname, '../../../drizzle');

  logger.info({ migrationsFolder }, '📂 Migrations Folder');

  // Masked URL debug
  const dbUrl = process.env.DATABASE_URL || '';
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  logger.info({ maskedUrl }, 'Checking DATABASE_URL');

  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      logger.info({ attempt: i }, `🔌 [Step 1] Getting DB Connection`);
      const { db, pool } = getDbConnection();

      logger.info('📡 [Step 2] Pinging DB directly via Pool (SELECT 1)...');
      // Use pool directly to get raw error from pg
      await pool.query('SELECT 1');
      logger.info('✅ [Step 2] DB is reachable.');

      logger.info({ lockId: LOCK_ID }, `🔒 [Step 3] Acquiring Advisory Lock`);

      // 2. Transactional Migration with Advisory Lock
      await db.transaction(async (tx) => {
        // Acquire lock immediately. If another job is running, this waits.
        // pg_advisory_xact_lock releases automatically at end of transaction.
        await tx.execute(sql`SELECT pg_advisory_xact_lock(${LOCK_ID})`);

        logger.info('🔓Verrou acquis! Starting migration...');

        // Run Drizzle migrations
        await migrate(tx, { migrationsFolder });
      });

      logger.info('✅ Migrations terminées avec succès (Verrou relâché).');
      process.exit(0);
    } catch (error: unknown) {
      const err = error as Error & {
        code?: string;
        address?: string;
        port?: number;
      };
      const errorDetails = {
        attempt: i,
        maxRetries: MAX_RETRIES,
        code: err.code,
        address: err.address,
        port: err.port,
      };
      logger.error(
        { err: error, ...errorDetails },
        `❌ Erreur tentative de migration`,
      );

      if (i < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        logger.error('💥 Abandon après échecs répétés.');
        process.exit(1);
      }
    }
  }
}

if (import.meta.main) {
  runSafeMigrations();
}
