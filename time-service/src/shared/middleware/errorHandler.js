/**
 * Global Error Handler
 *
 * Centralized error handling for consistent API responses
 * Logs errors and sanitizes error messages for production
 */

const logger = require('../utils/logger');
const config = require('../../../config');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Log error
  logger.error('Request error', {
    statusCode,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip
  });

  // Handle specific error types

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys(err.keyPattern)[0];
    details = `${field} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Don't leak error details in production
  if (config.env === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = null;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details })
  });
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler
};
