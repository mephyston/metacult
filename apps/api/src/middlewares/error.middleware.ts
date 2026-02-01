import { Elysia } from 'elysia';
import { AppError, API_MESSAGES } from '@metacult/shared-core';
import { logger } from '@metacult/backend-infrastructure';

/**
 * Global Error Handling Middleware for Elysia
 *
 * Catches all errors thrown in the application and formats them consistently:
 * 1. Validation Errors (TypeBox/Elysia native) → 422 Unprocessable Entity
 * 2. Business/Domain Errors (AppError subclasses) → Appropriate HTTP status
 * 3. Unknown Errors → 500 Internal Server Error
 *
 * All errors are logged with Pino for observability
 */
export const errorMiddleware = new Elysia({ name: 'error-middleware' }).onError(
  ({ code, error, set, request }) => {
    const requestId = request.headers.get('x-request-id') || 'unknown';
    const method = request.method;
    const url = request.url;

    // 1. Validation Errors (TypeBox/Elysia schema validation)
    if (code === 'VALIDATION') {
      set.status = 422;

      logger.warn(
        {
          requestId,
          method,
          url,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validationErrors: (error as any).all || error.message,
        },
        'Validation Error',
      );

      return {
        code: 'VALIDATION_ERROR',
        message: API_MESSAGES.ERRORS.VALIDATION_FAILED,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (error as any).all || error.message,
      };
    }

    // 2. Known Business/Domain Errors (AppError hierarchy)
    if (error instanceof AppError) {
      set.status = error.statusCode;

      // Log at appropriate level based on status code
      if (error.statusCode >= 500) {
        logger.error(
          {
            requestId,
            method,
            url,
            err: error,
            code: error.code,
            details: error.details,
          },
          `AppError: ${error.message}`,
        );
      } else {
        logger.warn(
          {
            requestId,
            method,
            url,
            code: error.code,
            details: error.details,
          },
          `AppError: ${error.message}`,
        );
      }

      return {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      };
    }

    // 3. NOT_FOUND errors (Elysia route not found)
    if (code === 'NOT_FOUND') {
      set.status = 404;

      logger.warn(
        {
          requestId,
          method,
          url,
        },
        'Route Not Found',
      );

      return {
        code: 'NOT_FOUND',
        message: API_MESSAGES.ERRORS.ROUTE_NOT_FOUND,
      };
    }

    // 4. Unknown/Unhandled Errors (crashes, exceptions)
    set.status = 500;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(
      {
        requestId,
        method,
        url,
        err: error,
        stack: errorStack,
      },
      `Unhandled Server Error: ${errorMessage}`,
    );

    // Don't leak error details in production
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: API_MESSAGES.ERRORS.INTERNAL_SERVER_ERROR,
    };
  },
);
