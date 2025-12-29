import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as authSchema from './schema/auth.schema';

let pool: Pool;
let db: ReturnType<typeof drizzle>;

export function getDbConnection<T extends Record<string, unknown>>(customSchema?: T) {
    if (!pool) {
        console.log('🔌 Connecting to Database...');
        const isProduction = process.env.NODE_ENV === 'production';
        const connectionString = process.env.DATABASE_URL;
        console.log(`🔌 Connecting to Database (URL length: ${connectionString?.length || 0})`);

        pool = new Pool({
            connectionString,
            ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        });

        const finalSchema = customSchema ? { ...schema, ...authSchema, ...customSchema } : { ...schema, ...authSchema };
        db = drizzle(pool, { schema: finalSchema }) as any;
    }
    return { pool, db };
}
