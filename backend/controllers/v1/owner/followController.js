const OwnerFollow = require('../../../models/OwnerFollow');
const User = require('../../../models/User');
const OwnerProfile = require('../../../models/OwnerProfile');

/**
 * @desc    Follow another owner
 * @route   POST /api/v1/owner/follow/:targetOwnerId
 * @access  Private (Owner only)
 */
exports.followOwner = async (req, res) => {
  try {
    const followerOwnerId = req.user._id;
    const { targetOwnerId } = req.params;

    // Validation: Cannot follow yourself
    if (followerOwnerId.toString() === targetOwnerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Validation: Check if target user exists and is an owner
    const targetUser = await User.findById(targetOwnerId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (targetUser.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Owners can only follow other owners'
      });
    }

    // Check if already following
    const existingFollow = await OwnerFollow.findOne({
      followerUserId: followerOwnerId,
      targetOwnerId: targetOwnerId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this owner'
      });
    }

    // Create follow relationship
    await OwnerFollow.create({
      followerUserId: followerOwnerId,
      targetOwnerId: targetOwnerId
    });

    // Update follower/following counts in profiles
    await Promise.all([
      OwnerProfile.findOneAndUpdate(
        { userId: followerOwnerId },
        { $inc: { following: 1 } }
      ),
      OwnerProfile.findOneAndUpdate(
        { userId: targetOwnerId },
        { $inc: { followers: 1 } }
      )
    ]);

    res.status(201).json({
      success: true,
      message: 'Successfully followed owner'
    });
  } catch (error) {
    console.error('Follow owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow owner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Unfollow an owner
 * @route   DELETE /api/v1/owner/follow/:targetOwnerId
 * @access  Private (Owner only)
 */
exports.unfollowOwner = async (req, res) => {
  try {
    const followerOwnerId = req.user._id;
    const { targetOwnerId } = req.params;

    // Find and delete follow relationship
    const follow = await OwnerFollow.findOneAndDelete({
      followerUserId: followerOwnerId,
      targetOwnerId: targetOwnerId
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'You are not following this owner'
      });
    }

    // Update follower/following counts in profiles
    await Promise.all([
      OwnerProfile.findOneAndUpdate(
        { userId: followerOwnerId },
        { $inc: { following: -1 } }
      ),
      OwnerProfile.findOneAndUpdate(
        { userId: targetOwnerId },
        { $inc: { followers: -1 } }
      )
    ]);

    res.json({
      success: true,
      message: 'Successfully unfollowed owner'
    });
  } catch (error) {
    console.error('Unfollow owner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow owner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get list of owners that current owner is following
 * @route   GET /api/v1/owner/follow/following
 * @access  Private (Owner only)
 */
exports.getFollowing = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const following = await OwnerFollow.find({ followerUserId: ownerId })
      .populate('targetOwnerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await OwnerFollow.countDocuments({ followerUserId: ownerId });

    res.json({
      success: true,
      data: following.map(f => ({
        userId: f.targetOwnerId._id,
        name: f.targetOwnerId.name,
        email: f.targetOwnerId.email,
        role: 'owner',
        followedAt: f.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get list of owners following the current owner
 * @route   GET /api/v1/owner/follow/followers
 * @access  Private (Owner only)
 */
exports.getFollowers = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const followers = await OwnerFollow.find({ targetOwnerId: ownerId })
      .populate('followerUserId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await OwnerFollow.countDocuments({ targetOwnerId: ownerId });

    res.json({
      success: true,
      data: followers.map(f => ({
        userId: f.followerUserId._id,
        name: f.followerUserId.name,
        email: f.followerUserId.email,
        role: 'owner',
        followedAt: f.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followers list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Check if current owner is following target owner
 * @route   GET /api/v1/owner/follow/check/:targetOwnerId
 * @access  Private (Owner only)
 */
exports.checkFollowStatus = async (req, res) => {
  try {
    const followerOwnerId = req.user._id;
    const { targetOwnerId } = req.params;

    const isFollowing = await OwnerFollow.exists({
      followerUserId: followerOwnerId,
      targetOwnerId: targetOwnerId
    });

    res.json({
      success: true,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check follow status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
