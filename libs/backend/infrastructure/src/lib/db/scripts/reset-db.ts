import { getDbConnection } from '../client';
import { sql } from 'drizzle-orm';

async function main() {
    const { db } = getDbConnection();

    console.log('💥 Dropping all tables...');

    await db.execute(sql`DROP SCHEMA IF EXISTS "auth" CASCADE;`);
    await db.execute(sql`DROP SCHEMA IF EXISTS "public" CASCADE;`);
    await db.execute(sql`CREATE SCHEMA "public";`);

    console.log('✅ DB Reset Complete.');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
