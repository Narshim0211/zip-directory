const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Per PRD Section 9: Error Isolation Design
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

const errorHandler = (err, req, res, next) => {
  // Log error
  const logData = {
    code: err.code || 'PROFILE_UNKNOWN_ERROR',
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.user?.userId || 'unauthenticated',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  
  logger.error('Error occurred', logData);
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'PROFILE_INTERNAL_ERROR';
  const message = err.isOperational
    ? err.message
    : 'An unexpected error occurred. Please try again later.';
  
  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      service: process.env.SERVICE_NAME || 'profile-service',
      ...(process.env.NODE_ENV === 'development' && { details: err.metadata }),
    },
  });
};

const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    'PROFILE_ROUTE_NOT_FOUND',
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
};
