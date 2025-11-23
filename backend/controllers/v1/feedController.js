const asyncHandler = require('../../middleWare/asyncHandler');
const { getGlobalFeed, enrichWithProfiles, enrichWithReactions } = require('../../services/feedAggregatorService');

/**
 * @route   GET /api/v1/feed
 * @desc    Get unified feed (posts + surveys) with world-class ranking algorithm
 * @access  Public/Private (works for both)
 */
exports.getFeed = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const cursor = req.query.cursor || null;
  const userId = req.user?._id?.toString() || null; // Optional - if authenticated
  const userRole = req.user?.role || null; // visitor or owner

  // Get ranked feed from aggregator service (velocity + follow boost + premium boost)
  const feedResult = await getGlobalFeed({ limit, cursor, userId, userRole });

  // Enrich with profile data (avatar, handle, slug)
  let items = await enrichWithProfiles(feedResult.items);

  // Enrich with reaction counts (likes, loves) and user's reaction state
  items = await enrichWithReactions(items, userId);

  res.json({
    success: true,
    items: items.map(item => ({
      type: item.type,
      data: {
        ...item,
        _rankingScore: item._rankingScore, // Expose ranking score for debugging
        _isFollowed: item._isFollowed,
      }
    })),
    nextCursor: feedResult.nextCursor,
    hasMore: !!feedResult.nextCursor,
    meta: feedResult.meta,
  });
});

/**
 * @route   GET /api/v1/feed/owner
 * @desc    Get owner-specific feed with world-class ranking algorithm
 * @access  Private (owner only)
 */
exports.getOwnerFeed = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const cursor = req.query.cursor || null;
  const userId = req.user?._id?.toString();
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  // Use same unified feed with ranking (no need for separate owner feed logic)
  const feedResult = await getGlobalFeed({ limit, cursor, userId, userRole });

  // Enrich with profile data (avatar, handle, slug)
  let items = await enrichWithProfiles(feedResult.items);

  // Enrich with reaction counts and user's reaction state
  items = await enrichWithReactions(items, userId);

  res.json({
    success: true,
    items: items.map(item => ({
      type: item.type,
      data: {
        ...item,
        _rankingScore: item._rankingScore,
        _isFollowed: item._isFollowed,
      }
    })),
    nextCursor: feedResult.nextCursor,
    hasMore: !!feedResult.nextCursor,
    meta: feedResult.meta,
  });
});
