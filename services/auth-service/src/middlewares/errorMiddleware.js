const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Per Part 13.3.1: Service-specific error namespaces
 * Per Part 14.5.1: Backend error handling standard
 * Per Part 16.5: Enterprise-grade error handling
 */

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(code, message, statusCode = 500, metadata = {}) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  // Log error (mask sensitive data)
  const logData = {
    code: err.code || 'AUTH_UNKNOWN_ERROR',
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.user?._id || 'unauthenticated',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  
  logger.error('Error occurred', logData);
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'AUTH_INTERNAL_ERROR';
  const message = err.isOperational
    ? err.message
    : 'An unexpected error occurred. Please try again later.';
  
  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      service: process.env.SERVICE_NAME || 'auth-service',
      ...(process.env.NODE_ENV === 'development' && { details: err.metadata }),
    },
  });
};

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    'AUTH_ROUTE_NOT_FOUND',
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

/**
 * Unhandled Rejection Handler (Safety Net)
 */
const setupUnhandledRejectionHandlers = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason?.message || reason,
      promise,
    });
    // Don't crash in production - log and continue
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });
  
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });
    // This is critical - must restart
    process.exit(1);
  });
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  setupUnhandledRejectionHandlers,
};
