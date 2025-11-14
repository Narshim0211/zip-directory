/**
 * Winston Logger Configuration
 *
 * Structured logging for production-grade observability
 */

const winston = require('winston');
const path = require('path');
const config = require('../../../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: config.serviceName },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: config.env === 'production' ? logFormat : consoleFormat
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(config.logging.filePath, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(config.logging.filePath, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add request logging helper
logger.logRequest = (req, res, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.id,
    ip: req.ip
  });
};

module.exports = logger;
