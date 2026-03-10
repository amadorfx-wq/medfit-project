/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TYPED ERROR HIERARCHY — Core Infrastructure                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Lives in src/core/ — no branding, reusable in any clinic instance.
 *
 * Usage in services:
 *   throw new ServiceError('BillingService', 'createCharge failed', cause);
 *
 * Usage in API routes:
 *   return apiResponse.error(err); // automatically picks correct status code
 */

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(resource: string) {
    super('CONFLICT', `${resource} already exists`, 409);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ServiceError extends AppError {
  constructor(service: string, message: string, cause?: unknown) {
    super('SERVICE_ERROR', `[${service}] ${message}`, 500, cause);
    this.name = 'ServiceError';
  }
}
