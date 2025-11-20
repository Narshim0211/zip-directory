const Follow = require('../models/Follow');
const User = require('../models/User');

/**
 * Follow a user with role-aware permission checks
 * @param {ObjectId} followerId - ID of user who is following
 * @param {ObjectId} targetId - ID of user to be followed
 * @param {string} followerRole - Role of follower ('owner' | 'visitor')
 * @param {string} targetRole - Role of target user ('owner' | 'visitor')
 * @returns {Promise<Object>} Follow document or error
 */
const follow = async (followerId, targetId, followerRole, targetRole) => {
  // 🔍 DEBUG LOGGING
  console.log('[followService.follow] Called with:');
  console.log('  followerId:', followerId);
  console.log('  targetId:', targetId);
  console.log('  followerRole:', followerRole);
  console.log('  targetRole:', targetRole);

  // Permission check: Owner CANNOT follow Visitor
  const canFollowResult = Follow.canFollow(followerRole, targetRole);
  console.log('[followService.follow] canFollow result:', canFollowResult);

  if (!canFollowResult) {
    console.log('❌ [followService.follow] Permission denied - Owners cannot follow Visitors');
    throw new Error('Owners cannot follow Visitors');
  }

  // Check if already following (use new fields first, fallback to legacy)
  console.log('[followService.follow] Checking if already following...');
  const exists = await Follow.findOne({
    $or: [
      { followerId, followingId: targetId },
      { follower: followerId, following: targetId }
    ]
  });
  console.log('[followService.follow] Already following?', !!exists);

  if (exists) {
    console.log('✅ [followService.follow] Already following - returning existing');
    return {
      alreadyFollowing: true,
      follow: exists
    };
  }

  // Create follow with both new and legacy fields for backward compatibility
  console.log('[followService.follow] Creating new follow relationship...');
  const newFollow = await Follow.create({
    followerId,
    followingId: targetId,
    followerRole,
    followingRole: targetRole,
    // Legacy fields
    follower: followerId,
    following: targetId,
    relationType: `${followerRole}_to_${targetRole}` // Fixed: use underscores, not hyphens
  });
  console.log('✅ [followService.follow] Follow created successfully:', newFollow._id);
  console.log('[DEBUG] NEW FOLLOW RECORD:', JSON.stringify(newFollow, null, 2));
  return {
    alreadyFollowing: false,
    follow: newFollow
  };
};

/**
 * Unfollow a user
 * @param {ObjectId} followerId - ID of user who is unfollowing
 * @param {ObjectId} targetId - ID of user to be unfollowed
 * @returns {Promise<void>}
 */
const unfollow = async (followerId, targetId) => {
  // Delete using either new or legacy fields
  await Follow.findOneAndDelete({
    $or: [
      { followerId, followingId: targetId },
      { follower: followerId, following: targetId }
    ]
  });
};

/**
 * Get all users that a specific user is following
 * @param {ObjectId} followerId - ID of user
 * @returns {Promise<Array>} Array of follow documents with populated user data
 */
const getFollowing = async (followerId) => {
  return Follow.find({
    $or: [
      { followerId },
      { follower: followerId }
    ]
  })
    .populate('followingId', 'firstName lastName avatarUrl role handle slug')
    .populate('following', 'firstName lastName avatarUrl role handle slug');
};

/**
 * Get all users who are following a specific user
 * @param {ObjectId} targetId - ID of user
 * @returns {Promise<Array>} Array of follow documents with populated user data
 */
const getFollowers = async (targetId) => {
  return Follow.find({
    $or: [
      { followingId: targetId },
      { following: targetId }
    ]
  })
    .populate('followerId', 'firstName lastName avatarUrl role handle slug')
    .populate('follower', 'firstName lastName avatarUrl role handle slug');
};

/**
 * Check if user A is following user B
 * @param {ObjectId} followerId - ID of potential follower
 * @param {ObjectId} targetId - ID of potential target
 * @returns {Promise<boolean>}
 */
const isFollowing = async (followerId, targetId) => {
  const exists = await Follow.findOne({
    $or: [
      { followerId, followingId: targetId },
      { follower: followerId, following: targetId }
    ]
  });
  return !!exists;
};

/**
 * Get follow statistics for a user
 * @param {ObjectId} userId - ID of user
 * @returns {Promise<Object>} { followingCount, followersCount }
 */
const getFollowStats = async (userId) => {
  console.log('[DEBUG] getCounts called for:', userId);

  const [followingCount, followersCount] = await Promise.all([
    Follow.countDocuments({
      $or: [{ followerId: userId }, { follower: userId }]
    }),
    Follow.countDocuments({
      $or: [{ followingId: userId }, { following: userId }]
    })
  ]);

  console.log('[DEBUG] followingCount from DB:', followingCount);
  console.log('[DEBUG] followersCount from DB:', followersCount);
  console.log('[DEBUG] Returning object:', { followingCount, followersCount });

  return { followingCount, followersCount };
};

/**
 * Get follower/following counts for profile display
 * This is the same as getFollowStats but with clearer naming for profile use
 * @param {ObjectId} userId - ID of user
 * @returns {Promise<Object>} { followersCount, followingCount }
 */
const getCounts = async (userId) => {
  return getFollowStats(userId);
};

module.exports = {
  follow,
  unfollow,
  getFollowing,
  getFollowers,
  isFollowing,
  getFollowStats,
  getCounts
};
