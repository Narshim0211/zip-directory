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
  // Permission check: Owner CANNOT follow Visitor
  if (!Follow.canFollow(followerRole, targetRole)) {
    throw new Error('Owners cannot follow Visitors');
  }

  // Check if already following (use new fields first, fallback to legacy)
  const exists = await Follow.findOne({
    $or: [
      { followerId, followingId: targetId },
      { follower: followerId, following: targetId }
    ]
  });

  if (exists) {
    return { message: 'Already following', alreadyFollowing: true };
  }

  // Create follow with both new and legacy fields for backward compatibility
  return Follow.create({
    followerId,
    followingId: targetId,
    followerRole,
    followingRole: targetRole,
    // Legacy fields
    follower: followerId,
    following: targetId,
    relationType: `${followerRole}-${targetRole}`
  });
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
  const [followingCount, followersCount] = await Promise.all([
    Follow.countDocuments({
      $or: [{ followerId: userId }, { follower: userId }]
    }),
    Follow.countDocuments({
      $or: [{ followingId: userId }, { following: userId }]
    })
  ]);

  return { followingCount, followersCount };
};

module.exports = {
  follow,
  unfollow,
  getFollowing,
  getFollowers,
  isFollowing,
  getFollowStats
};
