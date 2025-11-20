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

  // 🔍 DEBUG LOGGING
  console.log('='.repeat(80));
  console.log('[FOLLOW POST] Request received');
  console.log('followerId:', followerId);
  console.log('targetId:', targetId);
  console.log('followerRole:', followerRole);
  console.log('targetId type:', typeof targetId);
  console.log('targetId length:', targetId?.length);
  console.log('='.repeat(80));

  // Prevent self-follow
  if (followerId.toString() === targetId) {
    console.log('❌ [FOLLOW POST] Self-follow attempt blocked');
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself'
    });
  }

  // Get target user role
  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    console.log('❌ [FOLLOW POST] Target user not found:', targetId);
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const targetRole = targetUser.role;
  console.log('[FOLLOW POST] Target user found, role:', targetRole);

  // Allow everyone to follow everyone (better engagement)
  // No role restrictions - owners can follow visitors, visitors can follow anyone

  // Use the follow service
  try {
    console.log('[FOLLOW POST] Calling followService.follow()');
    const result = await followService.follow(followerId, targetId, followerRole, targetRole);
    console.log('[FOLLOW POST] Service result:', result);

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
    console.log('❌ [FOLLOW POST] Error caught:', error.message);

    // Only these should be 400/404
    if (error.message === 'Owners cannot follow Visitors') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Internal server error
    console.error('FOLLOW ERROR:', error);
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
