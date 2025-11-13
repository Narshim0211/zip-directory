const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Auth Routes
 * Per Part 14.7.1: Rate limiting per route
 * Per Part 14.2.1: API route namespaces
 */

// Rate limiter for login/register (5 requests per 10 minutes)
const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000, // 10 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public Routes
 */

// POST /auth/register - Register new user
router.post('/register', authRateLimiter, authController.register);

// POST /auth/login - Login user
router.post('/login', authRateLimiter, authController.login);

// POST /auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

/**
 * Protected Routes (require authentication)
 */

// GET /auth/me - Get current user profile
router.get('/me', requireAuth, authController.getMe);

// POST /auth/logout - Logout user
router.post('/logout', requireAuth, authController.logout);

// PUT /auth/password - Update password
router.put('/password', requireAuth, authController.updatePassword);

/**
 * Health Check
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
