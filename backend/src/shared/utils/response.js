/**
 * Response Utilities - Shared Layer
 * Standardized API response helpers for consistent response formatting
 *
 * Clean Architecture: Shared/Common utilities used across layers
 * These utilities ensure consistent API response structure throughout the application
 */

/**
 * HTTP Status Codes Constants
 */
export const HttpStatus = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Standard success response structure
 * @param {any} data - Response data payload
 * @param {string} message - Success message
 * @param {object} meta - Optional metadata (pagination, etc.)
 * @returns {object} Formatted success response
 */
export const successResponse = (data, message = 'Success', meta = null) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Standard error response structure
 * @param {string} message - Error message
 * @param {string} code - Error code for client handling
 * @param {any} details - Additional error details (optional)
 * @returns {object} Formatted error response
 */
export const errorResponse = (message, code = 'ERROR', details = null) => {
  const response = {
    success: false,
    message,
    error: {
      code,
      timestamp: new Date().toISOString(),
    },
  };

  if (details) {
    response.error.details = details;
  }

  return response;
};

/**
 * Validation error response
 * @param {string[]} errors - Array of validation errors
 * @param {string} message - Main error message
 * @returns {object} Formatted validation error response
 */
export const validationErrorResponse = (errors, message = 'Validation failed') => {
  return {
    success: false,
    message,
    error: {
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Paginated response structure
 * @param {any[]} data - Array of data items
 * @param {object} pagination - Pagination details
 * @param {string} message - Success message
 * @returns {object} Formatted paginated response
 */
export const paginatedResponse = (data, pagination, message = 'Data retrieved successfully') => {
  return {
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page || pagination.currentPage || 1,
      totalPages: pagination.totalPages || Math.ceil(pagination.total / pagination.limit),
      totalItems: pagination.total || pagination.totalItems,
      itemsPerPage: pagination.limit || pagination.itemsPerPage,
      hasNextPage: pagination.hasNextPage ?? (pagination.page < pagination.totalPages),
      hasPrevPage: pagination.hasPrevPage ?? (pagination.page > 1),
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Created resource response
 * @param {any} data - Created resource data
 * @param {string} message - Success message
 * @param {string} location - Optional location header value
 * @returns {object} Formatted created response
 */
export const createdResponse = (data, message = 'Resource created successfully', location = null) => {
  const response = successResponse(data, message);
  if (location) {
    response.location = location;
  }
  return response;
};

/**
 * No content response (for DELETE operations)
 * @param {string} message - Success message
 * @returns {object} Formatted no content response
 */
export const noContentResponse = (message = 'Resource deleted successfully') => {
  return {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Unauthorized response
 * @param {string} message - Error message
 * @returns {object} Formatted unauthorized response
 */
export const unauthorizedResponse = (message = 'Authentication required') => {
  return errorResponse(message, 'UNAUTHORIZED');
};

/**
 * Forbidden response
 * @param {string} message - Error message
 * @returns {object} Formatted forbidden response
 */
export const forbiddenResponse = (message = 'Access denied') => {
  return errorResponse(message, 'FORBIDDEN');
};

/**
 * Not found response
 * @param {string} resource - Name of the resource not found
 * @returns {object} Formatted not found response
 */
export const notFoundResponse = (resource = 'Resource') => {
  return errorResponse(`${resource} not found`, 'NOT_FOUND');
};

/**
 * Conflict response (for duplicate resources)
 * @param {string} message - Error message
 * @returns {object} Formatted conflict response
 */
export const conflictResponse = (message = 'Resource already exists') => {
  return errorResponse(message, 'CONFLICT');
};

/**
 * Internal server error response
 * @param {string} message - Error message
 * @param {boolean} includeStack - Whether to include stack trace (dev only)
 * @param {Error} error - Original error object
 * @returns {object} Formatted server error response
 */
export const serverErrorResponse = (
  message = 'Internal server error',
  includeStack = false,
  error = null
) => {
  const response = errorResponse(message, 'INTERNAL_ERROR');

  if (includeStack && error && process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }

  return response;
};

/**
 * Rate limit exceeded response
 * @param {number} retryAfter - Seconds until retry is allowed
 * @returns {object} Formatted rate limit response
 */
export const rateLimitResponse = (retryAfter = 60) => {
  return {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Express response sender - sends formatted response with correct status
 * @param {Response} res - Express response object
 * @param {number} status - HTTP status code
 * @param {object} body - Response body
 * @returns {Response} Express response
 */
export const sendResponse = (res, status, body) => {
  return res.status(status).json(body);
};

/**
 * Send success response
 * @param {Response} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 */
export const sendSuccess = (res, data, message = 'Success', status = HttpStatus.OK) => {
  return sendResponse(res, status, successResponse(data, message));
};

/**
 * Send created response
 * @param {Response} res - Express response object
 * @param {any} data - Created resource data
 * @param {string} message - Success message
 */
export const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendResponse(res, HttpStatus.CREATED, createdResponse(data, message));
};

/**
 * Send error response
 * @param {Response} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {string} code - Error code
 */
export const sendError = (res, status, message, code = 'ERROR') => {
  return sendResponse(res, status, errorResponse(message, code));
};

/**
 * Send paginated response
 * @param {Response} res - Express response object
 * @param {any[]} data - Array of data items
 * @param {object} pagination - Pagination info
 * @param {string} message - Success message
 */
export const sendPaginated = (res, data, pagination, message) => {
  return sendResponse(res, HttpStatus.OK, paginatedResponse(data, pagination, message));
};

// Default export for convenient importing
export default {
  HttpStatus,
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  serverErrorResponse,
  rateLimitResponse,
  sendResponse,
  sendSuccess,
  sendCreated,
  sendError,
  sendPaginated,
};
