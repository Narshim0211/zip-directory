const Follow = require('../models/Follow');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const followService = require('../services/followService');
const withTryCatch = require('../middleWare/withTryCatch');

/**
 * POST /api/follow
 * Follow a user with role-aware permission checks
 *
 * Body:
 * - targetUserId: ObjectId - ID of user to follow
 * - targetUserRole: string - Role of target user ('owner' | 'visitor')
 *
 * Permission Logic:
 * - Owner CANNOT follow Visitor
 * - Visitor CAN follow Owner
 * - Visitor CAN follow Visitor
 * - Owner CAN follow Owner
 */
exports.followUser = withTryCatch(async (req, res) => {
  const { targetUserId, targetUserRole } = req.body;
  const targetId = targetUserId || req.params.id; // Support both body and params

  // Validate input
  if (!targetId) {
    return res.status(400).json({
      success: false,
      message: 'Target user ID is required'
    });
  }

  // Cannot follow yourself
  if (String(targetId) === String(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself'
    });
  }

  // Get target user to determine role if not provided
  const target = await User.findById(targetId);
  if (!target) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const followerRole = req.user.role;
  const targetRole = targetUserRole || target.role;

  // Check permission using Follow model's canFollow method
  if (!Follow.canFollow(followerRole, targetRole)) {
    return res.status(403).json({
      success: false,
      message: 'Owners cannot follow Visitors',
      permission: {
        followerRole,
        targetRole,
        allowed: false
      }
    });
  }

  // Attempt to follow
  const result = await followService.follow(
    req.user._id,
    targetId,
    followerRole,
    targetRole
  );

  // Check if already following
  if (result.alreadyFollowing) {
    return res.status(200).json({
      success: true,
      message: 'Already following this user',
      alreadyFollowing: true
    });
  }

  // Send notification
  try {
    await notificationService.notifyUser({
      recipientId: targetId,
      senderId: req.user._id,
      type: 'new_follower',
      title: 'New follower',
      message: `${req.user.firstName || req.user.name || 'Someone'} started following you.`,
      contentType: 'user',
      contentId: targetId
    });
  } catch (notifError) {
    // Don't fail the request if notification fails
    console.error('[followUser] Notification failed:', notifError.message);
  }

  res.status(201).json({
    success: true,
    message: 'Successfully followed user',
    data: result
  });
}, 'followUser');

/**
 * DELETE /api/follow/unfollow
 * Unfollow a user
 *
 * Body:
 * - targetUserId: ObjectId - ID of user to unfollow
 */
exports.unfollowUser = withTryCatch(async (req, res) => {
  const { targetUserId } = req.body;
  const targetId = targetUserId || req.params.id; // Support both body and params

  if (!targetId) {
    return res.status(400).json({
      success: false,
      message: 'Target user ID is required'
    });
  }

  await followService.unfollow(req.user._id, targetId);

  res.json({
    success: true,
    message: 'Successfully unfollowed user'
  });
}, 'unfollowUser');

/**
 * GET /api/follow/followers/:id
 * Get list of users following the specified user
 */
exports.listFollowers = withTryCatch(async (req, res) => {
  const targetId = req.params.id || req.user._id;

  const followers = await followService.getFollowers(targetId);

  // Map to user objects (handle both new and legacy field names)
  const followerUsers = followers.map(doc => doc.followerId || doc.follower).filter(Boolean);

  res.json({
    success: true,
    data: followerUsers,
    count: followerUsers.length
  });
}, 'listFollowers');

/**
 * GET /api/follow/following/:id
 * Get list of users that the specified user is following
 */
exports.listFollowing = withTryCatch(async (req, res) => {
  const userId = req.params.id || req.user._id;

  const following = await followService.getFollowing(userId);

  // Map to user objects (handle both new and legacy field names)
  const followingUsers = following.map(doc => doc.followingId || doc.following).filter(Boolean);

  res.json({
    success: true,
    data: followingUsers,
    count: followingUsers.length
  });
}, 'listFollowing');

/**
 * GET /api/follow/stats/:id
 * Get follow statistics for a user
 */
exports.getFollowStats = withTryCatch(async (req, res) => {
  const userId = req.params.id || req.user._id;

  const stats = await followService.getFollowStats(userId);

  res.json({
    success: true,
    data: stats
  });
}, 'getFollowStats');

/**
 * GET /api/follow/is-following/:id
 * Check if current user is following the specified user
 */
exports.checkIsFollowing = withTryCatch(async (req, res) => {
  const targetId = req.params.id;

  if (!targetId) {
    return res.status(400).json({
      success: false,
      message: 'Target user ID is required'
    });
  }

  const isFollowing = await followService.isFollowing(req.user._id, targetId);

  res.json({
    success: true,
    data: { isFollowing }
  });
}, 'checkIsFollowing');
