/**
 * Application Error Classes - Shared Layer
 * Custom error classes for clean error handling across the application
 *
 * Clean Architecture: Shared Layer
 * - Used by all layers (Domain, Application, Infrastructure, Presentation)
 * - Provides consistent error handling patterns
 * - Framework-agnostic error definitions
 */

/**
 * Base Application Error
 * All custom errors should extend this class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Distinguishes operational errors from programming errors

    // Captures stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   * @returns {object}
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }

  /**
   * Get HTTP status code for this error
   * @returns {number}
   */
  getStatusCode() {
    return this.statusCode;
  }
}

/**
 * Validation Error - 400 Bad Request
 * Used when input validation fails
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.errors = Array.isArray(details) ? details : details ? [details] : [];
  }

  /**
   * Create from array of validation errors
   * @param {string[]} errors - Array of error messages
   * @returns {ValidationError}
   */
  static fromErrors(errors) {
    return new ValidationError(errors.join(', '), errors);
  }
}

/**
 * Not Found Error - 404 Not Found
 * Used when a requested resource doesn't exist
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
    this.resourceId = id;
  }
}

/**
 * Conflict Error - 409 Conflict
 * Used when there's a conflict with existing data
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(message, 409, code);
  }

  /**
   * Create for duplicate email
   * @returns {ConflictError}
   */
  static emailExists() {
    return new ConflictError('Email already exists', 'EMAIL_EXISTS');
  }

  /**
   * Create for duplicate resource
   * @param {string} resource - Resource type
   * @returns {ConflictError}
   */
  static duplicate(resource) {
    return new ConflictError(`${resource} already exists`, 'DUPLICATE_RESOURCE');
  }
}

/**
 * Authentication Error - 401 Unauthorized
 * Used when authentication is required but not provided or invalid
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', code = 'AUTHENTICATION_REQUIRED') {
    super(message, 401, code);
  }

  /**
   * Create for invalid token
   * @returns {AuthenticationError}
   */
  static invalidToken() {
    return new AuthenticationError('Invalid authentication token', 'INVALID_TOKEN');
  }

  /**
   * Create for expired token
   * @returns {AuthenticationError}
   */
  static tokenExpired() {
    return new AuthenticationError('Authentication token has expired', 'TOKEN_EXPIRED');
  }

  /**
   * Create for missing token
   * @returns {AuthenticationError}
   */
  static missingToken() {
    return new AuthenticationError('Authentication token is missing', 'MISSING_TOKEN');
  }
}

/**
 * Authorization Error - 403 Forbidden
 * Used when user doesn't have permission to access a resource
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied', code = 'FORBIDDEN') {
    super(message, 403, code);
  }

  /**
   * Create for insufficient permissions
   * @param {string} action - The action being attempted
   * @returns {AuthorizationError}
   */
  static insufficientPermissions(action = 'perform this action') {
    return new AuthorizationError(
      `You do not have permission to ${action}`,
      'INSUFFICIENT_PERMISSIONS'
    );
  }

  /**
   * Create for role-based access denial
   * @param {string} requiredRole - The required role
   * @returns {AuthorizationError}
   */
  static roleRequired(requiredRole) {
    return new AuthorizationError(
      `This action requires ${requiredRole} role`,
      'ROLE_REQUIRED'
    );
  }
}

/**
 * Business Logic Error - 400 Bad Request
 * Used when business rules are violated
 */
class BusinessError extends AppError {
  constructor(message, code = 'BUSINESS_ERROR', details = null) {
    super(message, 400, code, details);
  }
}

/**
 * Database Error - 500 Internal Server Error
 * Used when database operations fail
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * External Service Error - 502 Bad Gateway
 * Used when external service calls fail
 */
class ExternalServiceError extends AppError {
  constructor(serviceName, message = 'External service unavailable') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.serviceName = serviceName;
  }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 * Used when rate limits are exceeded
 */
class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * Internal Server Error - 500
 * Used for unexpected server errors
 */
class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred', originalError = null) {
    super(message, 500, 'INTERNAL_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Check if an error is an operational error (expected) vs programming error (bug)
 * @param {Error} error
 * @returns {boolean}
 */
const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Create appropriate error from HTTP status code
 * @param {number} statusCode
 * @param {string} message
 * @returns {AppError}
 */
const createErrorFromStatus = (statusCode, message) => {
  switch (statusCode) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message);
    case 429:
      return new RateLimitError();
    case 500:
    default:
      return new InternalError(message);
  }
};

export {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthenticationError,
  AuthorizationError,
  BusinessError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
  InternalError,
  isOperationalError,
  createErrorFromStatus,
};

export default AppError;
