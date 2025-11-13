const profileResolverService = require('../services/profileResolverService');
const followService = require('../services/followService');
const withTryCatch = require('../middleWare/withTryCatch');

/**
 * GET /api/profile/:handle
 * Resolve a profile by handle (works for both Owner and Visitor)
 *
 * Returns unified profile data with role detection
 * Public endpoint - no authentication required
 */
exports.getProfileByHandle = withTryCatch(async (req, res) => {
  const { handle } = req.params;

  if (!handle) {
    return res.status(400).json({
      success: false,
      message: 'Handle is required'
    });
  }

  // Resolve profile
  const profile = await profileResolverService.resolveProfileByHandle(handle);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  // If user is authenticated, check if they're following this profile
  let isFollowing = false;
  if (req.user && req.user._id) {
    isFollowing = await followService.isFollowing(req.user._id, profile.userId);
  }

  // Get follow stats
  const stats = await followService.getFollowStats(profile.userId);

  res.json({
    success: true,
    data: {
      ...profile,
      isFollowing,
      stats
    }
  });
}, 'getProfileByHandle');

/**
 * GET /api/profile/id/:userId
 * Get basic profile info by user ID
 *
 * Public endpoint - no authentication required
 */
exports.getProfileById = withTryCatch(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const profile = await profileResolverService.getProfileById(userId);

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  res.json({
    success: true,
    data: profile
  });
}, 'getProfileById');

/**
 * GET /api/profile/check-handle/:handle
 * Check if a handle is available
 *
 * Public endpoint - useful for registration/profile updates
 */
exports.checkHandleAvailability = withTryCatch(async (req, res) => {
  const { handle } = req.params;

  if (!handle) {
    return res.status(400).json({
      success: false,
      message: 'Handle is required'
    });
  }

  // If user is authenticated, exclude their own ID from the check
  const excludeUserId = req.user?._id || null;

  const available = await profileResolverService.isHandleAvailable(handle, excludeUserId);

  res.json({
    success: true,
    data: {
      handle,
      available
    }
  });
}, 'checkHandleAvailability');

module.exports = exports;
