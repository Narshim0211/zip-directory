/**
 * Rate Limiting Middleware
 *
 * Prevents abuse and ensures fair usage
 * Per-user rate limiting for API protection
 */

const rateLimit = require('express-rate-limit');
const config = require('../../../config');
const logger = require('../utils/logger');

/**
 * Create rate limiter with user-based key
 */
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.maxRequests,

    // Key generator: use user ID if authenticated, otherwise IP
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },

    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        userId: req.user?.id,
        ip: req.ip,
        path: req.path
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000) || 60
      });
    },

    // Skip successful requests from counting (optional)
    skipSuccessfulRequests: false,

    // Skip failed requests from counting (optional)
    skipFailedRequests: false,

    // Standard headers
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Default rate limiter for general API endpoints
const apiLimiter = createRateLimiter();

// Stricter rate limiter for write operations (POST, PUT, DELETE)
const writeLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 30 // 30 requests per minute
});

module.exports = {
  apiLimiter,
  writeLimiter,
  createRateLimiter
};
