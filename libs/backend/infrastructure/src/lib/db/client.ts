import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as authSchema from './schema/auth.schema';

let pool: Pool;
let db: ReturnType<typeof drizzle>;

export const getDbConnection = () => {
    if (!pool) {
        console.log('🔌 Connecting to Database...');
        pool = new Pool({ connectionString: process.env.DATABASE_URL });
        db = drizzle(pool, { schema: { ...schema, ...authSchema } });
    }
    return { pool, db };
};
