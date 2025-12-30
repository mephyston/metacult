import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as authSchema from './schema/auth.schema';

let pool: Pool;
let db: ReturnType<typeof drizzle>;

/**
 * Initialise ou récupère la connexion Singleton à la base de données PostgreSQL via Drizzle ORM.
 * Combine le schéma de base et les schémas d'authentification ou personnalisés.
 * 
 * @param {T} customSchema - Schéma additionnel optionnel.
 * @returns {{ pool: Pool, db: NodePgDatabase }} L'instance du pool et de Drizzle.
 */
export function getDbConnection<T extends Record<string, unknown>>(customSchema?: T) {
    if (!pool) {
        console.log('🔌 Connexion à la base de données...');
        const isProduction = process.env.NODE_ENV === 'production';
        const connectionString = process.env.DATABASE_URL;
        console.log(`🔌 Connexion DB (taille URL: ${connectionString?.length || 0})`);

        pool = new Pool({
            connectionString,
            ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        });

        const finalSchema = customSchema ? { ...schema, ...authSchema, ...customSchema } : { ...schema, ...authSchema };
        db = drizzle(pool, { schema: finalSchema }) as any;
    }
    return { pool, db };
}
