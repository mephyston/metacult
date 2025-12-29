import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getDbConnection } from './client';
import path from 'path';

async function runMigrations() {
    console.log('📦 Running Database Migrations...');
    try {
        const { db } = getDbConnection();
        // Assuming process.cwd() is the project root in Docker (/usr/src/app)
        const migrationsFolder = path.join(process.cwd(), 'drizzle');

        console.log(`🔹 Migrations folder: ${migrationsFolder}`);

        await migrate(db, { migrationsFolder });

        console.log('✅ Migrations applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
