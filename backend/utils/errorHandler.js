/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async Error Wrapper - Catches async errors and passes to error handler
 * Usage: asyncHandler(async (req, res, next) => { ... })
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Prevent sending headers twice
  if (res.headersSent) {
    return next(err);
  }

  let error = { ...err };
  error.message = err.message;
  error.code = err.code;

  // Default values
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid resource ID';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 5MB';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    } else {
      message = err.message;
    }
  }

  // File type errors (custom)
  if (err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    errorCode = 'INVALID_FILE_TYPE';
    message = err.message || 'Invalid file type';
  }

  // Premium booking profile errors
  if (err.code === 'MEDIA_UPLOAD_FAILED') {
    statusCode = 500;
    errorCode = 'MEDIA_UPLOAD_FAILED';
    message = err.message || 'Failed to upload media file';
  }

  if (err.code === 'INVALID_MEDIA') {
    statusCode = 400;
    errorCode = 'INVALID_MEDIA';
    message = err.message || 'Invalid media file format or size';
  }

  if (err.code === 'PROFILE_INACTIVE') {
    statusCode = 403;
    errorCode = 'PROFILE_INACTIVE';
    message = err.message || 'Public profile is not active';
  }

  if (err.code === 'SERVICE_NOT_ALLOWED') {
    statusCode = 403;
    errorCode = 'SERVICE_NOT_ALLOWED';
    message = err.message || 'Service access not permitted';
  }

  // CORS errors
  if (err.message && err.message.includes('Not allowed by CORS')) {
    statusCode = 403;
    errorCode = 'CORS_ERROR';
    message = 'Cross-origin request blocked';
  }

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      code: errorCode,
      message: message,
      stack: err.stack,
      path: req?.originalUrl,
      method: req?.method,
    });
  }

  // Log critical errors in production
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    console.error('🚨 Critical Error:', {
      code: errorCode,
      message: message,
      path: req?.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
    },
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    'ROUTE_NOT_FOUND',
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

module.exports = { AppError, errorHandler, asyncHandler, notFoundHandler };
