const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    err.statusCode ||
    err.status ||
    (err.name === 'MongoServerError' && err.code === 11000 ? 400 : 500);

  let message = err.message || 'Internal Server Error';
  if (err.name === 'MongoServerError' && err.code === 11000) {
    message = 'Duplicate record already exists';
  }

  if (err.message && err.message.startsWith('Not allowed by CORS')) {
    message = 'CORS: origin not allowed';
  }

  logger.error({
    message,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
