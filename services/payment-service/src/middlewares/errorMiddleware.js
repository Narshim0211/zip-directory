const logger = require('../utils/logger');

/**
 * Custom Error Class
 * Per PRD Section 9: Error Handling
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', metadata = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.metadata = metadata;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  logger.error('Error occurred', {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
    metadata: error.metadata,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
    error.code = 'INVALID_ID';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    error.statusCode = 400;
    error.code = 'DUPLICATE_ENTRY';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    error.message = errors.join(', ');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
  }

  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    error.message = err.message || 'Payment processing error';
    error.statusCode = 402;
    error.code = 'STRIPE_ERROR';
  }

  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        metadata: error.metadata,
      }),
    },
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
};
