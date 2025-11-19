const logger = require('../../utils/logger');

/**
 * Global Error Handler
 * Centralized error handling for entire backend
 * All controllers use next(error) to reach here
 * NO duplicate error handling logic
 */

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 * Must be last middleware in app
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log error for debugging
  if (err.statusCode === 500) {
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    });
  } else {
    logger.warn('Client Error:', {
      message: err.message,
      url: req.originalUrl,
      method: req.method
    });
  }
  
  // Development: send full error
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }
  
  // Production: send clean error
  // Operational errors: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }
  
  // Programming or unknown errors: don't leak details
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong. Please try again later.'
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Cannot find ${req.originalUrl} on this server`,
    404
  );
  next(error);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Mongoose Error Handlers
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? Object.values(err.keyValue)[0] : 'unknown';
  const message = `Duplicate field value: "${value}". Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

/**
 * Enhanced Global Error Handler with Mongoose Support
 */
const enhancedErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') error = handleCastErrorDB(error);
  
  // Mongoose duplicate key
  if (err.code === 11000) error = handleDuplicateFieldsDB(error);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  
  // Pass to base handler
  globalErrorHandler(error, req, res, next);
};

module.exports = {
  AppError,
  globalErrorHandler: enhancedErrorHandler,
  notFoundHandler,
  catchAsync
};
