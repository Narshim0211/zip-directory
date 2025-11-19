const asyncHandler = require('../../middleWare/asyncHandler');
const Follow = require('../../models/Follow');
const Survey = require('../../models/Survey');
const OwnerPost = require('../../models/OwnerPost');
const User = require('../../models/User');

/**
 * @route   GET /api/v1/users/:userId/stats
 * @desc    Get user statistics (followers, following, posts, surveys)
 * @access  Public (but optimized for authenticated users)
 */
exports.getUserStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate user exists
  const user = await User.findById(userId).select('role');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Run all queries in parallel for performance
  const [followersCount, followingCount, postsCount, surveysCount] = await Promise.all([
    // Count followers
    Follow.countDocuments({ followingId: userId }),
    
    // Count following
    Follow.countDocuments({ followerId: userId }),
    
    // Count posts (only for owners)
    user.role === 'owner' ? OwnerPost.countDocuments({ ownerId: userId }) : 0,
    
    // Count surveys (both visitors and owners can create surveys)
    Survey.countDocuments({ author: userId }),
  ]);

  res.json({
    success: true,
    stats: {
      followers: followersCount,
      following: followingCount,
      posts: postsCount,
      surveys: surveysCount,
    },
  });
});
