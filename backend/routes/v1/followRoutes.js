const express = require('express');
const router = express.Router();
const { protect } = require('../../middleWare/authMiddleware');
const followService = require('../../services/followService');
const asyncHandler = require('../../middleWare/asyncHandler');
const Follow = require('../../models/Follow');
const User = require('../../models/User');

/**
 * Unified Follow Routes
 * Works for all user types (visitor-to-visitor, visitor-to-owner, owner-to-owner)
 * Base: /api/v1/follow
 */

/**
 * @route   POST /api/v1/follow/:targetId
 * @desc    Follow a user (role-aware)
 * @access  Private
 */
router.post('/:targetId', protect, asyncHandler(async (req, res) => {
  const followerId = req.user._id;
  const { targetId } = req.params;
  const followerRole = req.user.role;

  // 🔍 DEBUG LOGGING - Only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[FOLLOW] followerId:', followerId, 'targetId:', targetId, 'role:', followerRole);
  }

  // Prevent self-follow
  if (followerId.toString() === targetId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself'
    });
  }

  // Get target user role
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const targetRole = targetUser.role;

  // Allow everyone to follow everyone (better engagement)
  // No role restrictions - owners can follow visitors, visitors can follow anyone

  // Use the follow service
  try {
    const result = await followService.follow(followerId, targetId, followerRole, targetRole);

    // If already following, return 200 with flag (NOT 400)
    if (result.alreadyFollowing) {
      return res.status(200).json({
        success: true,
        alreadyFollowing: true,
        follow: result.follow,
        message: 'You are already following this user'
      });
    }

    // New follow created
    return res.status(201).json({
      success: true,
      alreadyFollowing: false,
      follow: result.follow,
      message: 'Successfully followed user'
    });
  } catch (error) {
    // Only these should be 400/404
    if (error.message === 'Owners cannot follow Visitors') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Internal server error - log only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('FOLLOW ERROR:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

/**
 * @route   DELETE /api/v1/follow/:targetId
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete('/:targetId', protect, asyncHandler(async (req, res) => {
  const followerId = req.user._id;
  const { targetId } = req.params;

  await followService.unfollow(followerId, targetId);

  res.json({
    success: true,
    message: 'Successfully unfollowed user'
  });
}));

/**
 * @route   GET /api/v1/follow/check/:targetId
 * @desc    Check if current user is following target user + get follow stats
 * @access  Private
 */
router.get('/check/:targetId', protect, asyncHandler(async (req, res) => {
  const followerId = req.user._id;
  const { targetId } = req.params;

  const [isFollowing, stats] = await Promise.all([
    followService.isFollowing(followerId, targetId),
    followService.getFollowStats(targetId)
  ]);

  res.json({
    success: true,
    isFollowing,
    followersCount: stats.followersCount,
    followingCount: stats.followingCount
  });
}));

/**
 * @route   GET /api/v1/follow/following
 * @desc    Get list of users current user is following
 * @access  Private
 */
router.get('/following', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const following = await followService.getFollowing(userId);

  res.json({
    success: true,
    data: following,
    total: following.length
  });
}));

/**
 * @route   GET /api/v1/follow/followers
 * @desc    Get list of users following current user
 * @access  Private
 */
router.get('/followers', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const followers = await followService.getFollowers(userId);

  res.json({
    success: true,
    data: followers,
    total: followers.length
  });
}));

module.exports = router;
