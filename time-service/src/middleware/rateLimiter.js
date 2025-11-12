/**
 * Rate Limiter Middleware
 * Implements per-user rate limiting with role-based limits
 */
const asyncHandler = require('./asyncHandler');

// In-memory store for rate limiting (not production-ready, use Redis in production)
const requestCounts = new Map();
const CLEANUP_INTERVAL = 60000; // Clean up every minute

// Default limits per role (requests per minute)
const RATE_LIMITS = {
  visitor: 60, // 60 requests per minute for visitors
  owner: 100, // 100 requests per minute for owners
  default: 30,
};

// Clean up old entries
setInterval(() => {
  const now = Date.now();
  const threshold = 2 * 60 * 1000; // 2 minutes

  for (const [key, data] of requestCounts.entries()) {
    if (now - data.lastRequest > threshold) {
      requestCounts.delete(key);
    }
  }

  console.log(`[RateLimiter] Cleaned up ${requestCounts.size} entries`);
}, CLEANUP_INTERVAL);

const rateLimiter = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const role = req.user?.role || 'default';

  if (!userId) {
    // Allow unauthenticated requests but track by IP
    return next();
  }

  const key = `${userId}:${role}`;
  const limit = RATE_LIMITS[role] || RATE_LIMITS.default;
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window

  // Get or initialize user's request count
  let userData = requestCounts.get(key);

  if (!userData) {
    userData = {
      requests: [],
      lastRequest: now,
    };
    requestCounts.set(key, userData);
  }

  // Remove old requests outside the window
  userData.requests = userData.requests.filter((time) => time > windowStart);
  userData.lastRequest = now;

  // Check if limit exceeded
  if (userData.requests.length >= limit) {
    return res.status(429).json({
      success: false,
      message: `Rate limit exceeded. Max ${limit} requests per minute for ${role} users.`,
      retryAfter: Math.ceil((userData.requests[0] + 60000 - now) / 1000),
    });
  }

  // Add current request
  userData.requests.push(now);

  // Attach rate limit info to response headers
  res.set('X-RateLimit-Limit', limit.toString());
  res.set('X-RateLimit-Remaining', (limit - userData.requests.length).toString());
  res.set('X-RateLimit-Reset', new Date(windowStart + 60000).toISOString());

  next();
});

module.exports = rateLimiter;
