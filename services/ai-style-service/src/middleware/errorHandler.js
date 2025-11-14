const logger = require('../utils/logger');

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
  const statusCode = err.statusCode || 500;
  const code = err.code || 'AI_STYLE_INTERNAL_ERROR';
  const message = err.isOperational ? err.message : 'Something went wrong. Please try again later.';

  logger.error('Request failed', {
    code,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    userId: req.userContext?.userId,
  });

  res.status(statusCode).json({
    success: false,
    code,
    message,
  });
};

const notFoundHandler = (req, res, next) => {
  next(new AppError('AI_ROUTE_NOT_FOUND', `Route ${req.originalUrl} not found`, 404));
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
};
