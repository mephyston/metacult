/**
 * Base class for all application errors
 * Provides structured error handling with HTTP status codes
 */
export abstract class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Domain/Business Logic Error
 * Used for validation errors, business rule violations
 * HTTP 400 Bad Request
 */
export class DomainError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'DOMAIN_ERROR', 400, details);
  }
}

/**
 * Resource Not Found Error
 * HTTP 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * Unauthorized Error
 * Used for authentication/authorization failures
 * HTTP 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'UNAUTHORIZED', 401, details);
  }
}

/**
 * Infrastructure Error
 * Used for external service failures (DB, Redis, APIs)
 * HTTP 500 Internal Server Error
 */
export class InfrastructureError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'INFRASTRUCTURE_ERROR', 500, details);
  }
}

/**
 * Forbidden Error
 * User is authenticated but lacks permissions
 * HTTP 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'FORBIDDEN', 403, details);
  }
}

/**
 * Conflict Error
 * Resource already exists or state conflict
 * HTTP 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFLICT', 409, details);
  }
}
