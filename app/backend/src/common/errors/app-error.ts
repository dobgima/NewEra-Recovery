import { v4 as uuid } from 'uuid';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errorId: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errorId = uuid();
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error codes for consistent error responses
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business logic
  INVALID_OPERATION: 'INVALID_OPERATION',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * Predefined error instances for common scenarios
 */
export const Errors = {
  Unauthorized: new AppError('Unauthorized', 401, ErrorCodes.UNAUTHORIZED),
  Forbidden: new AppError('Forbidden', 403, ErrorCodes.FORBIDDEN),
  NotFound: (resource: string) => new AppError(`${resource} not found`, 404, ErrorCodes.NOT_FOUND),
  AlreadyExists: (resource: string) => new AppError(`${resource} already exists`, 409, ErrorCodes.ALREADY_EXISTS),
  ValidationFailed: new AppError('Validation failed', 400, ErrorCodes.VALIDATION_ERROR),
  InternalServerError: new AppError('Internal server error', 500, ErrorCodes.INTERNAL_ERROR),
} as const;