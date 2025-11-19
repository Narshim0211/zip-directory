const asyncHandler = require('../../middleWare/asyncHandler');
const { buildFeed, buildOwnerFeed } = require('../../services/feedService');

/**
 * @route   GET /api/v1/feed
 * @desc    Get unified feed (posts + surveys) with smart ranking
 * @access  Public/Private (works for both)
 */
exports.getFeed = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const userId = req.user?._id; // Optional - if authenticated
  const userRole = req.user?.role; // visitor or owner
  
  const items = await buildFeed({ limit, userId, userRole });

  res.json({
    success: true,
    items,
    hasMore: items.length === limit,
  });
});

/**
 * @route   GET /api/v1/feed/owner
 * @desc    Get owner-specific feed (owner posts + all surveys, followed first)
 * @access  Private (owner only)
 */
exports.getOwnerFeed = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const userId = req.user?._id;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const items = await buildOwnerFeed({ limit, userId });

  res.json({
    success: true,
    items,
    hasMore: items.length === limit,
  });
});
