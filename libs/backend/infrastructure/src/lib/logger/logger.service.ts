import pino from 'pino';
import { configService } from '../config/configuration.service';

/**
 * Logger Service - Singleton wrapper around Pino
 * Provides structured logging with context-aware capabilities
 *
 * In Development: Pretty-printed logs for readability
 * In Production: JSON logs for log aggregation systems
 */
class LoggerService {
  private static instance: LoggerService;
  private logger: pino.Logger;

  private constructor() {
    const isDevelopment = configService.isDevelopment;

    this.logger = pino({
      level: isDevelopment ? 'debug' : 'info',
      // Pretty print in development for better DX
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
              singleLine: false,
            },
          }
        : undefined,
      // Base fields added to all logs
      base: {
        env: configService.get('NODE_ENV'),
      },
    });
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Create a child logger with context
   * Useful for adding module/service context to logs
   */
  public child(context: Record<string, unknown>): pino.Logger {
    return this.logger.child(context);
  }

  /**
   * Info level - General informational messages
   */
  public info(obj: unknown, msg?: string): void;
  public info(msg: string): void;
  public info(objOrMsg: unknown, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.info(objOrMsg);
    } else {
      this.logger.info(objOrMsg as object, msg);
    }
  }

  /**
   * Error level - Error messages (exceptions, failures)
   */
  public error(obj: unknown, msg?: string): void;
  public error(msg: string): void;
  public error(objOrMsg: unknown, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.error(objOrMsg);
    } else {
      this.logger.error(objOrMsg as object, msg);
    }
  }

  /**
   * Warn level - Warning messages (deprecated features, potential issues)
   */
  public warn(obj: unknown, msg?: string): void;
  public warn(msg: string): void;
  public warn(objOrMsg: unknown, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.warn(objOrMsg);
    } else {
      this.logger.warn(objOrMsg as object, msg);
    }
  }

  /**
   * Debug level - Detailed debugging information
   */
  public debug(obj: unknown, msg?: string): void;
  public debug(msg: string): void;
  public debug(objOrMsg: unknown, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.debug(objOrMsg);
    } else {
      this.logger.debug(objOrMsg as object, msg);
    }
  }

  /**
   * Fatal level - Application crash/termination events
   */
  public fatal(obj: unknown, msg?: string): void;
  public fatal(msg: string): void;
  public fatal(objOrMsg: unknown, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.fatal(objOrMsg);
    } else {
      this.logger.fatal(objOrMsg as object, msg);
    }
  }
}

// Export singleton instance
export const logger = LoggerService.getInstance();

// Export class for type purposes
export { LoggerService };
