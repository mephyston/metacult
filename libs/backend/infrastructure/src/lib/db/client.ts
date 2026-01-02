import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DefaultLogger, type LogWriter } from 'drizzle-orm/logger';
import { requestContext } from '../context/request-context';

export class TracingLogger extends DefaultLogger {
    constructor() {
        super({ writer: new TracingLogWriter() });
    }
}

class TracingLogWriter implements LogWriter {
    write(message: string) {
        const requestId = requestContext.getRequestId();
        const prefix = requestId ? `[Req: ${requestId}] ` : '';
        console.log(`${prefix}${message}`);
    }
}

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
        // console.log('🔌 Connexion à la base de données...'); // Too verbose
        const isProduction = process.env['NODE_ENV'] === 'production';
        const connectionString = process.env['DATABASE_URL'];
        // Default to SSL in prod, but allow explicit disable (e.g. for private networks)
        const useSsl = isProduction && process.env['DB_SSL'] !== 'false';

        pool = new Pool({
            connectionString,
            ssl: useSsl ? { rejectUnauthorized: false } : undefined,
            connectionTimeoutMillis: 5000, // Fail fast (5s) to allow retries
            idleTimeoutMillis: 30000,
        });

        console.log(`🔌 DB Config: SSL=${isProduction}, Timeout=5000ms`);

        // Schema is now provided by the caller (apps/api merges all schemas)
        const enableLogger = process.env['NODE_ENV'] !== 'production' || process.env['DEBUG_SQL'] === 'true';
        db = drizzle(pool, {
            schema: customSchema,
            logger: enableLogger ? new TracingLogger() : undefined
        }) as any;
    }
    return { pool, db };
}
