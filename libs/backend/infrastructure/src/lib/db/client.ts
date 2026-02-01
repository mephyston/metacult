import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DefaultLogger, type LogWriter } from 'drizzle-orm/logger';
import { requestContext } from '../context/request-context';
import { logger } from '../logger/logger.service';

export class TracingLogger extends DefaultLogger {
  constructor() {
    super({ writer: new TracingLogWriter() });
  }
}

class TracingLogWriter implements LogWriter {
  write(message: string) {
    const requestId = requestContext.getRequestId();
    const prefix = requestId ? `[Req: ${requestId}] ` : '';
    logger.debug(`${prefix}${message}`);
  }
}

let pool: Pool;
let db: ReturnType<typeof drizzle>;

import { configService } from '../config/configuration.service';

/**
 * Initialise ou récupère la connexion Singleton à la base de données PostgreSQL via Drizzle ORM.
 * Combine le schéma de base et les schémas d'authentification ou personnalisés.
 *
 * @param {T} customSchema - Schéma additionnel optionnel.
 * @returns {{ pool: Pool, db: NodePgDatabase }} L'instance du pool et de Drizzle.
 */
export function getDbConnection<T extends Record<string, unknown>>(
  customSchema?: T,
) {
  if (!pool) {
    // console.log('🔌 Connexion à la base de données...'); // Too verbose
    const isProduction = configService.isProduction;
    const connectionString = configService.databaseUrl;

    // Smart SSL: Disable for Railway Internal URLs (they don't need/support it usually)
    // Can be forced via DB_SSL env var
    const isRailwayInternal = connectionString.includes('.railway.internal');
    const dbSslConfig = configService.dbSsl;

    let useSsl = isProduction;
    // if (isRailwayInternal) useSsl = false;
    if (dbSslConfig === true) useSsl = true;
    if (dbSslConfig === false) useSsl = false;

    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });

    logger.info(
      {
        ssl: useSsl,
        isInternal: isRailwayInternal,
      },
      '[DB] Connection configured',
    );

    // Schema is now provided by the caller (apps/api merges all schemas)
    const enableLogger =
      configService.isDevelopment || configService.debugSql === true;
    db = drizzle(pool, {
      schema: customSchema,
      logger: enableLogger ? new TracingLogger() : undefined,
    }) as any;
  }
  return { pool, db };
}
