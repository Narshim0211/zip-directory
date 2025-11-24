const catchAsync = require('../utils/catchAsync');
const inviteService = require('../services/inviteService');

/**
 * Send an invitation
 * POST /api/invite
 * Body: { recipientEmail, message? }
 */
exports.sendInvite = catchAsync(async (req, res) => {
  const { recipientEmail, message } = req.body;

  // Validate input
  if (!recipientEmail || !recipientEmail.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Recipient email is required'
    });
  }

  const result = await inviteService.sendInvite({
    userId: req.user._id,
    recipientEmail: recipientEmail.trim(),
    message: message || ''
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(200).json(result);
});

/**
 * Get user's invite statistics
 * GET /api/invite/stats
 */
exports.getInviteStats = catchAsync(async (req, res) => {
  const result = await inviteService.getUserInviteStats(req.user._id);

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.status(200).json(result);
});

/**
 * Get user's invite history
 * GET /api/invite/history
 */
exports.getInviteHistory = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const result = await inviteService.getUserInviteHistory(req.user._id, limit);

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.status(200).json(result);
});

/**
 * Track invite click (public endpoint, no auth required)
 * GET /api/invite/track/:inviteId
 */
exports.trackClick = catchAsync(async (req, res) => {
  const { inviteId } = req.params;

  if (!inviteId) {
    return res.status(400).json({
      success: false,
      error: 'Invite ID is required'
    });
  }

  const result = await inviteService.trackInviteClick(inviteId);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.status(200).json(result);
});

/**
 * Get platform-wide invite statistics (admin only)
 * GET /api/invite/platform-stats
 */
exports.getPlatformStats = catchAsync(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  const result = await inviteService.getPlatformInviteStats();

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.status(200).json(result);
});
