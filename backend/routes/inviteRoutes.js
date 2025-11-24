const createRouter = require('./asyncRouter');
const router = createRouter();
const { protect } = require('../middleWare/authMiddleware');
const inviteController = require('../controllers/inviteController');

// Simple in-memory rate limiter (can be upgraded to Redis later)
const rateLimitMap = new Map();

const rateLimiter = (req, res, next) => {
  const userId = req.user._id.toString();
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10; // 10 invites per hour

  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }

  const userRequests = rateLimitMap.get(userId);

  // Remove requests outside the time window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
  rateLimitMap.set(userId, recentRequests);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many invites sent. Please wait an hour before sending more.'
    });
  }

  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);

  next();
};

// ===== PROTECTED ROUTES (require authentication) =====

/**
 * Send an invitation
 * POST /api/invite
 * Body: { recipientEmail, message? }
 */
router.post('/', protect, rateLimiter, inviteController.sendInvite);

/**
 * Get user's invite statistics
 * GET /api/invite/stats
 */
router.get('/stats', protect, inviteController.getInviteStats);

/**
 * Get user's invite history
 * GET /api/invite/history
 */
router.get('/history', protect, inviteController.getInviteHistory);

/**
 * Get platform-wide invite statistics (admin only)
 * GET /api/invite/platform-stats
 */
router.get('/platform-stats', protect, inviteController.getPlatformStats);

// ===== PUBLIC ROUTES (no authentication) =====

/**
 * Track invite click
 * GET /api/invite/track/:inviteId
 * Called when recipient clicks referral link
 */
router.get('/track/:inviteId', inviteController.trackClick);

module.exports = router;
