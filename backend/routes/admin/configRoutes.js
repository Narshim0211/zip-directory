/**
 * 🌐 ADMIN CONFIG ROUTES
 *
 * API endpoints for managing global platform configuration.
 * Admin-only access - protected by adminOnly middleware.
 *
 * Routes:
 * GET  /admin/config/comment-paywall - Get current paywall status
 * POST /admin/config/comment-paywall - Toggle paywall on/off
 *
 * Usage in frontend:
 * const res = await api.get('/admin/config/comment-paywall');
 * await api.post('/admin/config/comment-paywall', { enabled: false });
 */

const createRouter = require('../asyncRouter');
const router = createRouter();
const { protect, adminOnly } = require('../../middleWare/authMiddleware');
const { isCommentPaywallEnabled, setConfig } = require('../../services/configService');

/**
 * GET /admin/config/comment-paywall
 * Returns current state of comment paywall
 *
 * Response: { enabled: true/false }
 */
router.get('/comment-paywall', protect, adminOnly, async (req, res) => {
  try {
    const enabled = await isCommentPaywallEnabled();

    res.json({
      enabled,
      message: enabled
        ? 'Paywall is ON - Users need premium/chat pass to comment'
        : 'Paywall is OFF - Comments are free for everyone'
    });
  } catch (error) {
    console.error('[AdminConfigRoutes] GET comment-paywall failed:', error);
    res.status(500).json({
      message: 'Failed to fetch paywall status',
      error: error.message
    });
  }
});

/**
 * POST /admin/config/comment-paywall
 * Toggle comment paywall on/off
 *
 * Body: { enabled: boolean }
 * Response: { success: true, enabled: boolean }
 */
router.post('/comment-paywall', protect, adminOnly, async (req, res) => {
  try {
    const { enabled } = req.body;

    // Validation
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        message: 'Invalid request - "enabled" must be a boolean'
      });
    }

    // Update config with admin audit trail
    await setConfig('commentPaywallEnabled', enabled, req.user._id);

    console.log(`[AdminConfigRoutes] Comment paywall ${enabled ? 'ENABLED' : 'DISABLED'} by admin ${req.user.email}`);

    res.json({
      success: true,
      enabled,
      message: enabled
        ? 'Paywall enabled - Comments now require premium/chat pass'
        : 'Paywall disabled - Comments are now free for all users',
      updatedBy: req.user.email,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[AdminConfigRoutes] POST comment-paywall failed:', error);
    res.status(500).json({
      message: 'Failed to update paywall status',
      error: error.message
    });
  }
});

module.exports = router;
