import { getDbConnection } from '../client';
import { logger } from '../../logger/logger.service';
import { sql } from 'drizzle-orm';

async function main() {
  const { db } = getDbConnection();

  logger.info('💥 Dropping all tables...');

  await db.execute(sql`DROP SCHEMA IF EXISTS "auth" CASCADE;`);
  await db.execute(sql`DROP SCHEMA IF EXISTS "public" CASCADE;`);
  await db.execute(sql`CREATE SCHEMA "public";`);

  logger.info('✅ DB Reset Complete.');
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, 'Database reset failed');
  process.exit(1);
});
